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
          AND r.data = ?
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

  return {
    insert,
    deleteByMedicamentoId,
    select,
    selectByDia,
    selectByDiaComRegistro,
    deleteAll,
    selectByMedicamentoId,
  };
}
