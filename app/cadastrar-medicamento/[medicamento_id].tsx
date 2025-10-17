import DateTimePicker from "@/components/DateTimePicker";
import DosagemBottomSheet from "@/components/DosagemBottomSheet";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CadastrarMedicamento() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedDose, setSelectedDose] = useState<string>("unidade");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleOpenPress = () => bottomSheetRef.current?.expand();

  const formatDoseName = (dose: string) => {
    return dose.toLowerCase() === "mg" || dose.toLowerCase() === "ml"
      ? dose.toUpperCase()
      : dose.charAt(0).toUpperCase() + dose.slice(1);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      console.log("Seleção de imagem cancelada");
    } else {
      setSelectedImage(result.assets[0].uri);
      console.log(result);
    }
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1 px-4 bg-white pt-10">
        <View className="flex-1">
          {/* Seletor de horário */}
          <DateTimePicker
            onChange={(dias, hora, minuto) => console.log(dias, hora, minuto)}
          />

          {/* Input do nome do medicamento */}
          <TextInput
            placeholder="Nome do medicamento"
            className="border-b border-gray-300 pb-3 text-gray-800 text-xl h-16"
          />

          {/* Input + seletor de dosagem */}
          <View className="flex-row items-center space-x-4 mt-4">
            {/* Input da quantidade */}
            <TextInput
              placeholder="Dosagem"
              keyboardType="numeric"
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
          <TouchableOpacity className="flex-1 bg-gray-200 py-3 rounded-2xl mr-2">
            <Text className="text-center text-gray-700 font-semibold text-lg">
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 bg-sky-500 py-3 rounded-2xl ml-2">
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
