import DateTimePicker from "@/components/DateTimePicker";
import DosagemBottomSheet from "@/components/DosagemBottomSheet";
import { useMedicamentosTable } from "@/hooks/useMedicamentosTable";
import { useNotificacoesTable } from "@/hooks/useNotificacoesTable";
import { scheduleNotification } from "@/utils/notifee";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CadastrarMedicamento() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleOpenPress = () => bottomSheetRef.current?.expand();

  const [selectedDose, setSelectedDose] = useState<string>("unidade");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [nomeMedicamento, setNomeMedicamento] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([]);
  const [hora, setHora] = useState(0);
  const [minuto, setMinuto] = useState(0);

  const medicamentosTable = useMedicamentosTable();
  const notificacoesTable = useNotificacoesTable();

  const formatDoseName = (dose: string) => {
    return dose.toLowerCase() === "mg" || dose.toLowerCase() === "ml"
      ? dose.toUpperCase()
      : dose.charAt(0).toUpperCase() + dose.slice(1);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) {
        console.log("Seleção de imagem cancelada");
        return;
      }

      const uri = result.assets[0].uri;
      const fileName = uri.split("/").pop();
      const dest = FileSystem.documentDirectory + fileName;

      // Primeiro copia a imagem
      await FileSystem.copyAsync({ from: uri, to: dest });

      // Só então atualiza o estado
      setSelectedImage(dest);
      console.log("SelectedImage: " + selectedImage);
    } catch (error) {
      console.error("Erro ao copiar imagem:", error);
    }
  };

  async function handleSubmit() {
    try {
      const id_medicamento = await medicamentosTable.insert({
        nome_medicamento: nomeMedicamento,
        dosagem: Number(dosagem),
        medida: selectedDose,
        imagem_uri: selectedImage!,
      });

      for (const diaSemana of diasSelecionados) {
        const now = new Date();
        const target = new Date();
        target.setHours(hora, minuto, 0, 0);

        const diff = (diaSemana + 7 - now.getDay()) % 7;
        if (diff === 0 && target <= now) {
          target.setDate(target.getDate() + 7);
        } else {
          target.setDate(target.getDate() + diff);
        }

        const id_notifee = await scheduleNotification({
          title: `Hora do medicamento: ${nomeMedicamento}`,
          body: `Tomar ${dosagem} ${selectedDose}`,
          timestamp: target.getTime(),
        });

        await notificacoesTable.insert({
          id_notifee,
          id_medicamento: Number(id_medicamento),
          hora: `${hora.toString().padStart(2, "0")}:${minuto
            .toString()
            .padStart(2, "0")}`,
          dia: diaSemana,
        });
      }

      alert("Medicamento e notificações salvos!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar medicamento/notificação");
    } finally {
      router.back();
    }
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1 px-4 bg-white pt-10">
        <View className="flex-1">
          {/* Seletor de horário */}
          <DateTimePicker
            onChange={(dias, h, m) => {
              setDiasSelecionados(dias);
              setHora(h);
              setMinuto(m);
            }}
          />

          {/* Input do nome do medicamento */}
          <TextInput
            placeholder="Nome do medicamento"
            className="border-b border-gray-300 pb-3 text-gray-800 text-xl h-16"
            value={nomeMedicamento}
            onChangeText={setNomeMedicamento}
          />

          {/* Input + seletor de dosagem */}
          <View className="flex-row items-center space-x-4 mt-4">
            {/* Input da quantidade */}
            <TextInput
              placeholder="Dosagem"
              keyboardType="numeric"
              value={dosagem}
              onChangeText={setDosagem}
              className="flex-1 border-b border-gray-300 mr-4 pb-3 text-gray-800 text-xl h-16"
            />

            {/* Botão para abrir o BottomSheet */}
            <TouchableOpacity
              className="px-6 py-3 rounded-xl justify-center border border-gray-300 bg-white h-16"
              onPress={handleOpenPress}
            >
              <Text className="text-gray-700 text-center font-semibold text-lg">
                {formatDoseName(selectedDose)}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center border border-gray-300 bg-white rounded-xl h-16 mt-4 px-4"
            onPress={pickImage}
          >
            <MaterialIcons name="image" size={24} color="#6B7280" />
            <Text className="text-gray-600 text-center font-medium text-lg ml-2">
              {selectedImage
                ? selectedImage.split("/").pop()
                : "Selecionar imagem do medicamento"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botões de ação */}
        <View className="flex-row justify-between items-center py-4 px-6 border-t border-gray-200">
          <TouchableOpacity
            className="flex-1 bg-gray-200 py-3 rounded-2xl mr-2"
            onPress={() => router.back()}
          >
            <Text className="text-center text-gray-700 font-semibold text-lg">
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-sky-500 py-3 rounded-2xl ml-2"
            onPress={handleSubmit}
          >
            <Text className="text-center text-white font-semibold text-lg">
              Salvar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <DosagemBottomSheet
        ref={bottomSheetRef}
        onSelectDose={(dose) => {
          setSelectedDose(dose);
          bottomSheetRef.current?.close();
        }}
      />
    </GestureHandlerRootView>
  );
}
