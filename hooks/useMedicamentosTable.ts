import { useSQLiteContext } from "expo-sqlite";

export type Medicamento = {
  medicamento_id: number;
  nome: string;
  dosagem: string;
};

export function useMedicamentosTable() {
  const database = useSQLiteContext();

  async function insert(data: Omit<Medicamento, "medicamento_id">) {
    const statement = await database.prepareAsync(
      "INSERT INTO medicamentos (nome, dosagem) VALUES ($nome, $dosagem)"
    );

    try {
      const result = await statement.executeAsync({
        $nome: data.nome,
        $dosagem: data.dosagem,
      });

      const insertedRowId = result.lastInsertRowId.toLocaleString();
      return { insertedRowId };
    } catch (error) {
      console.log("Erro ao inserir medicamento:", error);
      throw error;
    } finally {
      await statement.finalizeAsync();

      // Sempre que for lidar com statement, é bom utilizar o finally para garantir que o statement será finalizado
    }
  }

  async function update(data: Medicamento) {
    const statement = await database.prepareAsync(
      "UPDATE medicamentos SET nome = $nome, dosagem = $dosagem WHERE medicamento_id = $medicamento_id"
    );

    try {
      await statement.executeAsync({
        $medicamento_id: data.medicamento_id,
        $nome: data.nome,
        $dosagem: data.dosagem,
      });
    } catch (error) {
      console.log("Erro ao atualizar medicamento:", error);
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function select(nome: string) {
    try {
      const query = "SELECT * FROM medicamentos WHERE nome LIKE ?";
      const response = await database.getAllAsync<Medicamento>(query, [
        `%${nome}%`,
      ]);

      return response;
    } catch (error) {
      console.log("Erro ao selecionar medicamento por nome:", error);
      throw error;
    }

    // Depois fazer uma versão separada para o select all e o select por parâmetro
  }

  async function remove(medicamento_id: number) {
    try {
      await database.execAsync(
        "DELETE FROM medicamentos WHERE medicamento_id = " + medicamento_id
      );
    } catch (error) {
      console.log("Erro ao deletar medicamento:", error);
      throw error;
    }

    // Delete é palavra reservada xD
  }

  async function selectById(medicamento_id: number) {
    try {
      const query = "SELECT * FROM medicamentos WHERE medicamento_id = ?";
      const response = await database.getFirstAsync<Medicamento>(query, [
        medicamento_id,
      ]);
      return response;
    } catch (error) {
      console.log("Erro ao selecionar medicamento por ID:", error);
      throw error;
    }
  }

  return { insert, update, select, remove, selectById };
}
