import NotificacaoCard from "@/components/NotificacaoCard";
import {
  Notificacao,
  useNotificacoesTable,
} from "@/hooks/useNotificacoesTable";
import { useRegistroMedicamentosTable } from "@/hooks/useRegistroMedicamentosTable";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type NotificacaoComRegistro = Notificacao & {
  nome_medicamento: string;
  dosagem: number;
  medida: string;
  imagem_uri: string;
  tomado: number | null;
};

export default function Notificacoes() {
  const navigation = useNavigation();

  const registroTable = useRegistroMedicamentosTable();

  const notificacoesTable = useNotificacoesTable();

  const [notificacoes, setNotificacoes] = useState<NotificacaoComRegistro[]>(
    []
  );

  async function handleSubmit(notificacao: NotificacaoComRegistro) {
    const hoje = new Date().toISOString().split("T")[0];

    try {
      await registroTable.insert({
        id_notifee: notificacao.id_notifee,
        data: hoje,
        tomado: 1,
      });

      setNotificacoes((prev) =>
        prev.map((n) =>
          n.id_notifee === notificacao.id_notifee ? { ...n, tomado: 1 } : n
        )
      );
    } catch (error) {
      console.log("Erro ao marcar como tomado:", error);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const agora = new Date();
      const dia = agora.getDay();
      const dataHoje = agora.toISOString().split("T")[0];

      try {
        const result = await notificacoesTable.selectByDiaComRegistro(
          dia,
          dataHoje
        );
        setNotificacoes(result);
        console.log("Notificações carregadas:", result);
      } catch (error) {
        console.log("Erro ao carregar notificações:", error);
      }
    });

    return unsubscribe;
  }, [navigation, notificacoesTable]);

  return (
    <SafeAreaView className="flex-1 px-4 bg-background">
      <View className="py-[84px] mb-6 justify-center items-center">
        <Text className="text-main font-extrabold text-3xl text-center">
          Medicamentos no dia de hoje
        </Text>
        <Text className="text-label text-lg text-center mt-2">
          {notificacoes.length > 0
            ? "Confira seus horários e doses"
            : "Nenhum medicamento registrado para hoje 🎉"}
        </Text>
      </View>

      <ScrollView>
        {notificacoes.map((notificacao) => (
          <NotificacaoCard
            key={notificacao.id_notifee}
            notificacao={notificacao}
            onPressTomado={() => handleSubmit(notificacao)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
