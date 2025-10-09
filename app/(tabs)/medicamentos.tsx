import {
  Medicamento,
  useMedicamentosTable,
} from "@/hooks/useMedicamentosTable";

import { Input } from "@/components/Input";
import { MedicamentoCard } from "@/components/MedicamentoCard";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

export default function Index() {
  const [search, setSearch] = useState("");
  const [medicamentoId, setMedicamentoId] = useState("");
  const [nome, setNome] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [hora, setHora] = useState("");
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const medicamentosTable = useMedicamentosTable();

  function details(item: Medicamento) {
    setMedicamentoId(String(item.medicamento_id));
    setNome(item.nome);
    setDosagem(item.dosagem);
  }

  async function handleSubmit() {
    if (medicamentoId) {
      await update();
    } else {
      await insert();
    }

    setMedicamentoId("");
    setNome("");
    setDosagem("");
    setDiaSemana("");
    setHora("");

    await select();
  }

  async function insert() {
    const response = await medicamentosTable.insert({
      nome,
      dosagem,
      dia_semana: Number(diaSemana),
      hora,
    });

    Alert.alert("Medicamento cadastrado com o ID: " + response.insertedRowId);

    // Se for necessário fazer alguma conversão de tipo (como string para number), dá pra por um try-catch aqui
  }

  async function update() {
    await medicamentosTable.update({
      medicamento_id: Number(medicamentoId),
      nome,
      dosagem,
      dia_semana: Number(diaSemana),
      hora,
    });

    // Se for necessário fazer alguma conversão de tipo (como string para number), dá pra por um try-catch aqui
  }

  async function select() {
    try {
      const response = await medicamentosTable.select(search);
      setMedicamentos(response);
    } catch (error) {
      console.log("Erro ao buscar medicamento:", error);
    }
  }

  async function remove(medicamento_id: number) {
    try {
      await medicamentosTable.remove(medicamento_id);
      await select();
    } catch (error) {
      console.log("Erro ao deletar medicamento:", error);
    }
  }

  useEffect(() => {
    select();
  }, [search]);

  return (
    <View className="p-4 bg-transparent gap-4">
      <Input
        placeholder="Nome"
        onChangeText={setNome}
        value={nome}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800"
      />

      <Input
        placeholder="Dosagem"
        onChangeText={setDosagem}
        value={dosagem}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800"
      />

      <Input
        placeholder="Dia da semana (0 = Domingo, 1 = Segunda...)"
        keyboardType="numeric"
        value={diaSemana}
        onChangeText={setDiaSemana}
      />

      <Input placeholder="Hora (HH:MM)" value={hora} onChangeText={setHora} />

      <Pressable
        onPress={handleSubmit}
        className="w-full py-3 rounded-xl bg-blue-600 items-center"
      >
        <Text className="text-white font-semibold text-lg">Salvar</Text>
      </Pressable>

      <Input
        placeholder="Pesquisar"
        onChangeText={setSearch}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800"
      />

      <FlatList
        data={medicamentos}
        keyExtractor={(item) => String(item.medicamento_id)}
        renderItem={({ item }) => (
          <MedicamentoCard
            data={item}
            onPress={() => details(item)}
            onDelete={() => remove(item.medicamento_id)}
            onOpen={() => router.navigate(`/details/${item.medicamento_id}`)}
          />
        )}
      />
    </View>
  );
}
