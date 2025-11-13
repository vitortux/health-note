import MedicamentoAlarme from "@/components/MedicamentoAlarme";
import {
  MedicamentoComAlarme,
  useMedicamentosTable,
} from "@/hooks/useMedicamentosTable";
import { useNotificacoesTable } from "@/hooks/useNotificacoesTable";
import { Feather } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Alarme = {
  id: string;
  id_medicamento: number;
  horario: string;
  dias: number[];
  nomeMedicamento: string;
  dosagem: number;
  medida: string;
  imagem?: string | null;
};

export default function Home() {
  const navigation = useNavigation();
  const medicamentosTable = useMedicamentosTable();
  const notificacoesTable = useNotificacoesTable();

  const [alarmes, setAlarmes] = useState<Alarme[]>([]);
  const [proximoMedicamento, setProximoMedicamento] = useState<any>();

  useEffect(() => {
    const carregarAlarmes = async () => {
      try {
        const result: MedicamentoComAlarme[] =
          await medicamentosTable.selectWithAlarme();
        const alarmesTransformados = result.map((row) => ({
          id: row.id_medicamento + "_" + row.hora,
          id_medicamento: row.id_medicamento,
          horario: row.hora,
          dias: row.dias.split(",").map(Number),
          nomeMedicamento: row.nome_medicamento,
          dosagem: row.dosagem,
          medida: row.medida,
          imagem: row.imagem_uri,
        }));

        setAlarmes(alarmesTransformados);

        const proximo = await notificacoesTable.getProximoMedicamento();

        setProximoMedicamento(proximo);
      } catch (error) {
        console.log("Erro ao carregar notificações:", error);
      }
    };

    carregarAlarmes();

    const unsubscribe = navigation.addListener("focus", carregarAlarmes);
    return unsubscribe;
  }, [navigation, medicamentosTable]);

  return (
    <SafeAreaView className="flex-1 px-4 bg-background">
      {/* Próximo medicamento */}
      <View className="py-[84px] mb-6 justify-center items-center">
        {proximoMedicamento ? (
          <>
            <Text className="text-main font-extrabold text-3xl text-center">
              {`"${proximoMedicamento.nome_medicamento}" ${
                proximoMedicamento.diffDias === 0
                  ? "hoje"
                  : proximoMedicamento.diffDias === 1
                    ? "amanhã"
                    : `em ${proximoMedicamento.diffDias} dias`
              }`}
            </Text>
            <Text className="text-label text-lg text-center">
              {`previsto p/ ${proximoMedicamento.data}, ${proximoMedicamento.hora}`}
            </Text>
          </>
        ) : (
          <Text className="text-main font-extrabold text-3xl text-center">
            Nenhum medicamento agendado
          </Text>
        )}
      </View>

      {/* Botões */}
      <View className="flex-row justify-end mb-4">
        <TouchableOpacity
          className="bg-primary p-3 rounded-full"
          onPress={() => router.navigate("/cadastrar-medicamento/null")}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Lista de alarmes */}
      <ScrollView
        className="mt-4"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {alarmes.map((alarme) => (
          <MedicamentoAlarme
            key={alarme.id}
            horario={alarme.horario}
            dias={alarme.dias}
            nomeMedicamento={alarme.nomeMedicamento}
            dosagem={alarme.dosagem}
            medida={alarme.medida}
            onPress={() =>
              router.navigate({
                pathname: "/cadastrar-medicamento/[medicamento_id]",
                params: {
                  medicamento_id: alarme.id_medicamento,
                  hora: alarme.horario.split(":")[0],
                  minuto: alarme.horario.split(":")[1],
                  dias: alarme.dias.join(","), // ex: "1,3,5"
                  nomeMedicamento: alarme.nomeMedicamento,
                  dosagem: alarme.dosagem,
                  medida: alarme.medida,
                  imagem: alarme.imagem,
                },
              })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
