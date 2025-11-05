import { format } from "date-fns";
import { useSQLiteContext } from "expo-sqlite";
import { useNotificacoesTable } from "./useNotificacoesTable";

export type RegistroMedicamento = {
  id_registro?: number;
  id_notifee: string | null;
  data_registro: string;
  hora_registro: string;
  hora_prevista: string | null;
  tomado: number;
  nome_medicamento: string;
  dosagem: number;
  medida: string;
  imagem_uri: string | null;
};

export function useRegistroMedicamentosTable() {
  const database = useSQLiteContext();
  const notificacoesTable = useNotificacoesTable();

  // Assumimos que o tipo RegistroMedicamento foi atualizado para incluir
  // data_registro, hora_registro e hora_prevista.

  async function insert(data: RegistroMedicamento) {
    const statement = await database.prepareAsync(
      "INSERT INTO registro_medicamentos (id_notifee, data_registro, hora_registro, hora_prevista, tomado, nome_medicamento, dosagem, medida, imagem_uri) VALUES ($id_notifee, $data_registro, $hora_registro, $hora_prevista, $tomado, $nome_medicamento, $dosagem, $medida, $imagem_uri)"
    );

    try {
      const result = await statement.executeAsync({
        $id_notifee: data.id_notifee,

        // ✅ CORREÇÃO AQUI: Nomes dos placeholders e das propriedades de 'data'
        $data_registro: data.data_registro,
        $hora_registro: data.hora_registro,
        $hora_prevista: data.hora_prevista,

        $tomado: data.tomado,
        $nome_medicamento: data.nome_medicamento,
        $dosagem: data.dosagem,
        $medida: data.medida,
        $imagem_uri: data.imagem_uri,
      });

      return result.lastInsertRowId;
    } catch (error) {
      console.log("Erro ao persistir registro:", error);
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function selectAll() {
    try {
      const allRows = await database.getAllAsync(
        `SELECT * FROM registro_medicamentos`
      );
      return allRows as RegistroMedicamento[];
    } catch (error) {
      console.log("Erro ao selecionar todos os medicamentos:", error);
      throw error;
    }
  }

  async function deleteAll() {
    try {
      await database.execAsync("DELETE FROM registro_medicamentos");
    } catch (error) {
      console.log("Erro ao deletar medicamento:", error);
      throw error;
    }
  }

  async function selectRegistrosByDate(data: string) {
    const query = `
      SELECT 
        nome_medicamento,
        hora_registro,
        hora_prevista,
        tomado
      FROM registro_medicamentos
      WHERE data_registro = ?
      ORDER BY hora_registro ASC;
    `;
    const response = await database.getAllAsync(query, [data]);
    return response;
  }

  // Tem que tirar as informações só dessa tabela, e tem que fazer alguma coisa com o relatório manual/relatório
  // automático por conta dessa parada de ciclo. Quando vc faz um manual, ele não deve inserir o restante como não tomado,
  // só pegar os registros até agora... Tô pensando em separar em duas funções separadas, amanhã vejo isso
  async function gerarRelatorio(data: Date) {
    const dataFormatada = format(data, "yyyy-MM-dd");
    const diaSemana = data.getDay();
    const horaAgora = format(new Date(), "HH:mm:ss");

    const notificacoesOntem = await notificacoesTable.selectByDiaComRegistro(
      diaSemana,
      dataFormatada
    );

    for (const notif of notificacoesOntem) {
      if (notif.tomado === null) {
        await insert({
          id_notifee: notif.id_notifee,
          data: dataFormatada,
          hora: horaAgora,
          tomado: 0,
        });
        notif.tomado = 0;
      }
    }

    return notificacoesOntem.map((notif) => {
      let status;
      if (notif.tomado === 1) {
        status = "✅ Tomado";
      } else if (notif.tomado === 2) {
        status = "⚠️ Tomado com atraso";
      } else {
        status = "❌ Não tomado";
      }
      return {
        nome: notif.nome_medicamento,
        hora: notif.hora,
        status,
      };
    });
  }

  async function selectAllComDetalhes() {
    try {
      const query = `
        SELECT 
          r.id_registro,
          r.data_registro AS data,
          r.hora_registro,
          r.hora_prevista, 
          r.tomado,
          r.id_notifee,
          r.nome_medicamento,
          r.dosagem,
          r.medida,
          r.imagem_uri
        FROM registro_medicamentos r
        ORDER BY r.data_registro DESC, r.hora_registro DESC; 
      `;
      const rows = await database.getAllAsync(query);
      return rows;
    } catch (error) {
      console.log("Erro ao selecionar registros com detalhes:", error);
      throw error;
    }
  }

  async function selectByNotifee(id_notifee: string) {
    try {
      const query = `
      SELECT * 
      FROM registro_medicamentos
      WHERE id_notifee = ? 
    `;
      const result = await database.getAllAsync(query, [id_notifee]);
      return result;
    } catch (error) {
      console.log("Erro ao buscar registro pelo id_notifee e data:", error);
      throw error;
    }
  }

  async function update(id_notifeeAntigo: string, id_notifeeNovo: string) {
    const statement = await database.prepareAsync(
      `UPDATE registro_medicamentos
     SET id_notifee = $id_notifeeNovo
     WHERE id_notifee = $id_notifeeAntigo`
    );

    try {
      await statement.executeAsync({
        $id_notifeeAntigo: id_notifeeAntigo,
        $id_notifeeNovo: id_notifeeNovo,
      });
    } catch (error) {
      console.log("Erro ao atualizar id_notifee no registro:", error);
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  return {
    insert,
    selectAll,
    deleteAll,
    gerarRelatorio,
    selectAllComDetalhes,
    selectByNotifee,
    update,
  };
}
