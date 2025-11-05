import { useSQLiteContext } from "expo-sqlite";

export type Notificacao = {
  id_notifee: string;
  id_medicamento: number;
  hora: string;
  dia: number;
  // timestamp: number;
};

export function useNotificacoesTable() {
  const database = useSQLiteContext();

  async function insert(data: Notificacao) {
    const statement = await database.prepareAsync(
      "INSERT INTO notificacoes (id_notifee, id_medicamento, hora, dia) VALUES ($id_notifee, $id_medicamento, $hora, $dia)"
    );

    try {
      await statement.executeAsync({
        $id_notifee: data.id_notifee,
        $id_medicamento: data.id_medicamento,
        $hora: data.hora,
        $dia: data.dia,
      });

      return { id_notifee: data.id_notifee };
    } catch (error) {
      console.log("Erro ao persistir notificação:", error);
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function update(data: {
    new_id_notifee?: string;
    id_notifee: string;
    hora: string;
    dia: number;
  }) {
    // Preparando a instrução SQL para atualizar a notificação
    const statement = await database.prepareAsync(
      "UPDATE notificacoes SET hora = $hora, dia = $dia, id_notifee = $new_id_notifee WHERE id_notifee = $id_notifee"
    );

    try {
      const newIdNotifee = data.new_id_notifee || data.id_notifee; // Se houver um novo id_notifee, usamos ele, caso contrário, mantemos o antigo

      // Executando a atualização no banco
      await statement.executeAsync({
        $id_notifee: data.id_notifee, // id_notifee antigo
        $new_id_notifee: newIdNotifee, // novo id_notifee
        $hora: data.hora,
        $dia: data.dia,
      });

      return { id_notifee: newIdNotifee }; // Retorna o id atualizado
    } catch (error) {
      console.log("Erro ao atualizar notificação:", error);
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function deleteByMedicamentoId(id_medicamento: number) {
    try {
      await database.runAsync(
        "DELETE FROM notificacoes WHERE id_medicamento = $id_medicamento",
        { $id_medicamento: id_medicamento }
      );
    } catch (error) {
      console.log("Erro ao deletar notificação:", error);
      throw error;
    }
  }

  async function select(id_notifee: string) {
    try {
      const query = "SELECT * FROM notificacoes WHERE id_notifee LIKE ?";
      const response = await database.getAllAsync<Notificacao>(query, [
        `%${id_notifee}%`,
      ]);

      return response;
    } catch (error) {
      console.log("Erro ao selecionar notificação por id:", error);
      throw error;
    }
  }

  async function selectByDia(dia: number) {
    try {
      const query = `
        SELECT 
          n.*, 
          m.nome_medicamento, 
          m.dosagem, 
          m.medida
        FROM notificacoes n
        JOIN medicamentos m 
          ON n.id_medicamento = m.id_medicamento
        WHERE n.dia = ?
        ORDER BY n.hora ASC
      `;

      const response = await database.getAllAsync<
        Notificacao & {
          nome_medicamento: string;
          dosagem: number;
          medida: string;
        }
      >(query, [dia]);

      return response;
    } catch (error) {
      console.log("Erro ao selecionar notificações por dia:", error);
      throw error;
    }
  }

  async function selectByDiaComRegistro(dia: number, dataHoje: string) {
    try {
      const query = `
        SELECT 
          n.*,
          m.nome_medicamento,
          m.dosagem,
          m.medida,
          m.imagem_uri,
          r.tomado
        FROM notificacoes n
        JOIN medicamentos m ON n.id_medicamento = m.id_medicamento
        LEFT JOIN registro_medicamentos r
          ON n.id_notifee = r.id_notifee
          AND r.data_registro = ?
        WHERE n.dia = ?
        ORDER BY n.hora ASC
      `;

      const response = await database.getAllAsync<
        Notificacao & {
          nome_medicamento: string;
          dosagem: number;
          medida: string;
          imagem_uri: string;
          tomado: number | null;
        }
      >(query, [dataHoje, dia]);

      return response;
    } catch (error) {
      console.log("Erro ao selecionar notificações com registro:", error);
      throw error;
    }
  }

  async function deleteAll() {
    try {
      await database.execAsync("DELETE FROM notificacoes");
    } catch (error) {
      console.log("Erro ao deletar medicamento:", error);
      throw error;
    }
  }

  async function selectByMedicamentoId(id_medicamento: number) {
    const query = `
      SELECT 
        id_notifee,
        hora,
        dia
      FROM notificacoes
      WHERE id_medicamento = ?
      ORDER BY hora ASC;
    `;

    return await database.getAllAsync(query, [id_medicamento]);
  }

  async function getProximoMedicamento() {
    const agora = new Date();
    const hojeDia = agora.getDay(); // 0 = domingo

    const rows = await database.getAllAsync(`
    SELECT n.*, m.nome_medicamento, m.dosagem, m.medida, m.imagem_uri
    FROM notificacoes n
    JOIN medicamentos m ON n.id_medicamento = m.id_medicamento
  `);

    if (!rows || rows.length === 0) return null;

    let proximo: any = null;
    let menorDiffMs = Number.MAX_SAFE_INTEGER;

    rows.forEach((row: any) => {
      const [hora, minuto] = row.hora.split(":").map(Number);

      row.dias = row.dias?.split(",").map(Number) || [row.dia]; // caso tenha múltiplos dias

      row.dias.forEach((dia: number) => {
        let diffDias = (dia - hojeDia + 7) % 7;

        const dataNotificacao = new Date();
        dataNotificacao.setDate(dataNotificacao.getDate() + diffDias);
        dataNotificacao.setHours(hora, minuto, 0, 0);

        // se já passou hoje, passa para a próxima semana
        if (dataNotificacao < agora) {
          dataNotificacao.setDate(dataNotificacao.getDate() + 7);
        }

        const diff = dataNotificacao.getTime() - agora.getTime();
        if (diff < menorDiffMs) {
          menorDiffMs = diff;
          proximo = { ...row, timestamp: dataNotificacao.getTime() };
        }
      });
    });

    if (!proximo) return null;

    const dataObj = new Date(proximo.timestamp);
    const diffDiasFinal = Math.floor(
      (dataObj.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      nome_medicamento: proximo.nome_medicamento,
      dosagem: proximo.dosagem,
      medida: proximo.medida,
      timestamp: proximo.timestamp,
      diffDias: diffDiasFinal,
      data: dataObj.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }),
      hora: dataObj.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      imagem_uri: proximo.imagem_uri,
    };
  }

  return {
    insert,
    update,
    deleteByMedicamentoId,
    select,
    selectByDia,
    selectByDiaComRegistro,
    deleteAll,
    selectByMedicamentoId,
    getProximoMedicamento,
  };
}
