import { useSQLiteContext } from "expo-sqlite";

export type Medicamento = {
  id_medicamento: number;
  nome_medicamento: string;
  dosagem: number;
  medida: string;
  imagem_uri: string;
};

export function useMedicamentosTable() {
  const database = useSQLiteContext();

  async function insert(data: Omit<Medicamento, "id_medicamento">) {
    const statement = await database.prepareAsync(
      "INSERT INTO medicamentos (nome_medicamento, dosagem, medida, imagem_uri) VALUES ($nome_medicamento, $dosagem, $medida, $imagem_uri)"
    );

    try {
      const result = await statement.executeAsync({
        $nome_medicamento: data.nome_medicamento,
        $dosagem: data.dosagem,
        $medida: data.medida,
        $imagem_uri: data.imagem_uri,
      });

      return result.lastInsertRowId;
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
      "UPDATE medicamentos SET nome_medicamento = $nome_medicamento, dosagem = $dosagem WHERE id_medicamento = $id_medicamento"
    );

    try {
      await statement.executeAsync({
        $id_medicamento: data.id_medicamento,
        $nome_medicamento: data.nome_medicamento,
        $dosagem: data.dosagem,
      });
    } catch (error) {
      console.log("Erro ao atualizar medicamento:", error);
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function select(nome_medicamento: string) {
    try {
      const query = "SELECT * FROM medicamentos WHERE nome_medicamento LIKE ?";
      const response = await database.getAllAsync<Medicamento>(query, [
        `%${nome_medicamento}%`,
      ]);

      return response;
    } catch (error) {
      console.log("Erro ao selecionar medicamento por nome:", error);
      throw error;
    }

    // Depois fazer uma versão separada para o select all e o select por parâmetro
  }

  async function remove(id_medicamento: number) {
    try {
      await database.execAsync(
        "DELETE FROM medicamentos WHERE id_medicamento = " + id_medicamento
      );
    } catch (error) {
      console.log("Erro ao deletar medicamento:", error);
      throw error;
    }

    // Delete é palavra reservada xD
  }

  async function selectById(id_medicamento: number) {
    try {
      const query = "SELECT * FROM medicamentos WHERE id_medicamento = ?";
      const response = await database.getFirstAsync<Medicamento>(query, [
        id_medicamento,
      ]);
      return response;
    } catch (error) {
      console.log("Erro ao selecionar medicamento por ID:", error);
      throw error;
    }
  }

  return { insert, update, select, remove, selectById };
}
