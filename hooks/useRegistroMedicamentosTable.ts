import { useSQLiteContext } from "expo-sqlite";
import { subMonths, format } from "date-fns";

export type RegistroMedicamento = {
  id_registro?: number;
  id_notifee: string;
  data: string;
  tomado: number;
};

export function useRegistroMedicamentosTable() {
  const database = useSQLiteContext();

  async function insert(data: RegistroMedicamento) {
    const statement = await database.prepareAsync(
      "INSERT INTO registro_medicamentos (id_notifee, data, tomado) VALUES ($id_notifee, $data, $tomado)"
    );

    try {
      const result = await statement.executeAsync({
        $id_notifee: data.id_notifee,
        $data: data.data,
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

  async function ensureDailyRecords(date: Date) {
    const dateString = format(date, "yyyy-MM-dd");

    // Pega todas as notificações existentes
    const notificacoes = await database.getAllAsync(`
    SELECT id_notifee, id_medicamento
    FROM notificacoes
  `);

    // Pega registros já existentes pra hoje
    const registrosHoje = await database.getAllAsync(
      `
    SELECT id_notifee
    FROM registro_medicamentos
    WHERE data = $data
    `,
      { $data: dateString }
    );

    const idsRegistrados = registrosHoje.map((r) => r.id_notifee);

    // Filtra notificações que ainda não têm registro
    const naoRegistrados = notificacoes.filter(
      (n) => !idsRegistrados.includes(n.id_notifee)
    );

    // Insere um registro "não tomado" (tomado = 0) para cada id_notifee
    for (const n of naoRegistrados) {
      await database.runAsync(
        `
      INSERT INTO registro_medicamentos (id_notifee, data, tomado)
      VALUES ($id_notifee, $data, 0)
      `,
        { $id_notifee: n.id_notifee, $data: dateString }
      );
    }

    console.log(
      `✅ ${naoRegistrados.length} registros não tomados inseridos automaticamente para ${dateString}`
    );
  }

  async function getDailyReport(date: Date) {
    await ensureDailyRecords(date);
    const dateString = format(date, "yyyy-MM-dd");

    const rows = await database.getAllAsync(
      `
    SELECT 
      m.nome_medicamento,
      n.hora,
      r.tomado
    FROM registro_medicamentos r
    JOIN notificacoes n ON n.id_notifee = r.id_notifee
    JOIN medicamentos m ON m.id_medicamento = n.id_medicamento
    WHERE r.data = $data
    ORDER BY n.hora ASC;
    `,
      { $data: dateString }
    );

    // Agrupa por medicamento, mantendo o primeiro horário e o pior status
    const grouped = rows.reduce(
      (acc, row) => {
        if (!acc[row.nome_medicamento]) {
          acc[row.nome_medicamento] = {
            nome: row.nome_medicamento,
            hora: row.hora,
            status:
              row.tomado === 1
                ? "✅ Tomou no horário"
                : row.tomado === 2
                  ? "⏰ Tomou com atraso"
                  : "❌ Não tomou",
          };
        } else {
          // Atualiza status se houver um pior (❌ > ⏰ > ✅)
          const statusAtual = acc[row.nome_medicamento].status;
          const novoStatus =
            row.tomado === 0
              ? "❌ Não tomou"
              : row.tomado === 2
                ? statusAtual === "✅ Tomou no horário"
                  ? "⏰ Tomou com atraso"
                  : statusAtual
                : statusAtual;

          acc[row.nome_medicamento].status = novoStatus;
        }
        return acc;
      },
      {} as Record<string, { nome: string; hora: string; status: string }>
    );

    return Object.values(grouped);
  }

  return { insert, selectAll, deleteAll, getDailyReport };
}
