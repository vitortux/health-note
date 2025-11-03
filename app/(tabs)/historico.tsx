import { RegistroItem } from "@/components/RegistroItem";
import { useRegistroMedicamentosTable } from "@/hooks/useRegistroMedicamentosTable";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Historico() {
  const navigation = useNavigation();
  const registroTable = useRegistroMedicamentosTable();

  const [registrosAgrupados, setRegistrosAgrupados] = useState<
    Record<string, any[]>
  >({});

  useEffect(() => {
    async function carregarHistorico() {
      try {
        const registros = await registroTable.selectAllComDetalhes();

        const agrupados = registros.reduce(
          (acc, registro) => {
            if (!acc[registro.data]) acc[registro.data] = [];
            acc[registro.data].push(registro);
            return acc;
          },
          {} as Record<string, any[]>
        );

        setRegistrosAgrupados(agrupados);
      } catch (error) {
        console.log("Erro ao carregar histórico:", error);
      }
    }

    const unsubscribe = navigation.addListener("focus", carregarHistorico);
    return unsubscribe;
  }, [navigation, registroTable]);

  const datas = Object.keys(registrosAgrupados).sort((a, b) =>
    a > b ? -1 : 1
  );

  return (
    <SafeAreaView className="flex-1 px-4 bg-background">
      {/* Header */}
      <View className="py-[84px] mb-6 justify-center items-center">
        <Text className="text-main font-extrabold text-3xl text-center">
          Histórico de medicamentos
        </Text>
        <Text className="text-label text-lg text-center mt-2">
          Veja seus registros anteriores de uso de medicamentos.
        </Text>
      </View>

      {/* Lista de registros */}
      <FlatList
        data={datas}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: data }) => (
          <View className="mb-8">
            <Text className="text-main font-bold text-2xl mb-3 px-4">
              {data}
            </Text>
            {registrosAgrupados[data].map((registro) => (
              <RegistroItem key={registro.id_registro} registro={registro} />
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
