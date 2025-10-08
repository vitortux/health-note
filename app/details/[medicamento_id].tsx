import { useMedicamentosTable } from "@/hooks/useMedicamentosTable";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function Details() {
  const params = useLocalSearchParams();
  const medicamentosTable = useMedicamentosTable();

  const [data, setData] = useState({
    nome: "",
    dosagem: "",
  });

  useEffect(() => {
    if (params.medicamento_id) {
      medicamentosTable
        .selectById(Number(params.medicamento_id))
        .then((response) => {
          if (response) {
            setData({
              nome: response.nome,
              dosagem: response.dosagem,
            });
          }
        });
    }
  }, [params.medicamento_id]);

  return (
    <View>
      <Text>Medicamento ID: {params.medicamento_id}</Text>
      <Text>Nome: {data.nome}</Text>
      <Text>Dosagem: {data.dosagem}</Text>
    </View>
  );
}
