import { format } from "date-fns";
import { useSQLiteContext } from "expo-sqlite";
import { useNotificacoesTable } from "./useNotificacoesTable";

export type RegistroMedicamento = {
  id_registro?: number;
  id_notifee: string;
  data: string;
  hora: string;
  tomado: number;
};

export function useRegistroMedicamentosTable() {
  const database = useSQLiteContext();
  const notificacoesTable = useNotificacoesTable();

  async function insert(data: RegistroMedicamento) {
    const statement = await database.prepareAsync(
      "INSERT INTO registro_medicamentos (id_notifee, data, hora, tomado) VALUES ($id_notifee, $data, $hora, $tomado)"
    );

    try {
      const result = await statement.executeAsync({
        $id_notifee: data.id_notifee,
        $data: data.data,
        $hora: data.hora,
        $tomado: data.tomado,
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
          r.data,
          r.hora AS hora_registro,
          r.tomado,
          n.id_notifee,
          n.hora AS hora_prevista,
          m.id_medicamento,
          m.nome_medicamento,
          m.dosagem,
          m.medida,
          m.imagem_uri
        FROM registro_medicamentos r
        JOIN notificacoes n ON r.id_notifee = n.id_notifee
        JOIN medicamentos m ON n.id_medicamento = m.id_medicamento
        ORDER BY r.data ASC, n.hora ASC;
      `;
      const rows = await database.getAllAsync(query);
      return rows;
    } catch (error) {
      console.log("Erro ao selecionar registros com detalhes:", error);
      throw error;
    }
  }

  return {
    insert,
    selectAll,
    deleteAll,
    gerarRelatorio,
    selectAllComDetalhes,
  };
}
