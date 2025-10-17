import { useSQLiteContext } from "expo-sqlite";

export type Horario = {
  horario_id: number;
  medicamento_id: number;
  dia_semana: number;
  hora: string;
};

export function useHorariosTable() {
  const database = useSQLiteContext();

  async function insert(data: Omit<Horario, "horario_id">) {
    const statement = await database.prepareAsync(
      "INSERT INTO medicamento_horarios (medicamento_id, dia_semana, hora) VALUES ($medicamento_id, $dia_semana, $hora)"
    );

    try {
      const result = await statement.executeAsync({
        $medicamento_id: data.medicamento_id,
        $dia_semana: data.dia_semana,
        $hora: data.hora,
      });

      const insertedRowId = result.lastInsertRowId.toLocaleString();
      return { insertedRowId };
    } catch (error) {
      console.log("Erro ao inserir horário:", error);
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  return { insert };
}
