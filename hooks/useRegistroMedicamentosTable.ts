import { useSQLiteContext } from "expo-sqlite";

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

  return { insert, selectAll, deleteAll };
}
