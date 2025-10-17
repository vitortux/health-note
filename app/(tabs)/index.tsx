import MedicamentoAlarme from "@/components/MedicamentoAlarme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const alarmes = [
    { id: "1", horario: "06:00", dias: ["dom", "seg", "ter"] },
    { id: "2", horario: "08:00", dias: ["seg", "qua", "sex"] },
    { id: "3", horario: "09:30", dias: ["ter", "qui"] },
    { id: "4", horario: "12:00", dias: ["dom", "qua", "sex"] },
    { id: "5", horario: "13:30", dias: ["seg", "ter", "qui"] },
    { id: "6", horario: "15:00", dias: ["qua", "sex"] },
    { id: "7", horario: "16:30", dias: ["dom", "seg"] },
    { id: "8", horario: "18:00", dias: ["ter", "qua", "qui"] },
    { id: "9", horario: "20:00", dias: ["sex", "sab"] },
    {
      id: "10",
      horario: "22:00",
      dias: ["dom", "seg", "ter", "qua", "qui", "sex"],
    },
  ];

  return (
    <SafeAreaView className="flex-1 px-4 bg-white">
      {/* View de informações do próximo medicamento */}
      <View className="py-[84px] mb-6 justify-center items-center">
        <Text className="text-gray-800 font-extrabold text-3xl text-center">
          Medicamento em 2 dias
        </Text>
        <Text className="text-gray-600 text-lg text-center">
          seg., 13 de out., 12:00
        </Text>
      </View>

      {/* View de botões no canto superior direito */}
      <View className="flex-row justify-end mb-4">
        <TouchableOpacity
          className="bg-sky-500 p-3 rounded-full"
          onPress={() => router.navigate("/cadastrar-medicamento/null")}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-sky-500 p-3 rounded-full ml-2">
          <Feather name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Lista de medicamentos */}
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
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
