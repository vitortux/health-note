import DateTimePicker from "@/components/DateTimePicker";
import DosagemBottomSheet from "@/components/DosagemBottomSheet";
import ImagemBottomSheet from "@/components/ImagemBottomSheet";
import { useConfig } from "@/context/ConfigContext";
import { useMedicamentosTable } from "@/hooks/useMedicamentosTable";
import { useNotificacoesTable } from "@/hooks/useNotificacoesTable";
import { useRegistroMedicamentosTable } from "@/hooks/useRegistroMedicamentosTable";
import { cancelNotification, scheduleNotification } from "@/utils/notifee";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CadastrarMedicamento() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleOpenPress = () => bottomSheetRef.current?.expand();

  const bottomSheetRefImage = useRef<BottomSheet>(null);
  const handleOpenImagePress = () => bottomSheetRefImage.current?.expand();

  const params = useLocalSearchParams();
  const { theme } = useConfig();

  const idMedicamento = Number(params.medicamento_id);
  const isEditing = !Number.isNaN(idMedicamento);

  // Estados iniciais vindo dos parâmetros da Home
  const [nomeMedicamento, setNomeMedicamento] = useState(
    params.nomeMedicamento || ""
  );
  const [dosagem, setDosagem] = useState(params.dosagem?.toString() || "");
  const [selectedDose, setSelectedDose] = useState(params.medida || "unidade");
  const [selectedImage, setSelectedImage] = useState(params.imagem || null);
  const [diasSelecionados, setDiasSelecionados] = useState(
    params.dias?.split(",").map(Number) || []
  );
  const [hora, setHora] = useState(Number(params.hora) || 0);
  const [minuto, setMinuto] = useState(Number(params.minuto) || 0);

  const medicamentosTable = useMedicamentosTable();
  const notificacoesTable = useNotificacoesTable();
  const registroTable = useRegistroMedicamentosTable();

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
      const dest = FileSystem.documentDirectory! + fileName;

      // Primeiro copia a imagem
      await FileSystem.copyAsync({ from: uri, to: dest });

      // Só então atualiza o estado
      setSelectedImage(dest);
    } catch (error) {
      console.error("Erro ao copiar imagem:", error);
    }
  };

  async function handleSubmit() {
    const erros: string[] = [];

    if (!nomeMedicamento.trim()) {
      erros.push("Informe o nome do medicamento.");
    }

    if (!dosagem || Number(dosagem) <= 0) {
      erros.push("Informe uma dosagem válida.");
    }

    if (!selectedDose) {
      erros.push("Selecione a unidade de medida.");
    }

    if (!selectedImage) {
      erros.push("Selecione uma imagem do medicamento.");
    }

    if (!diasSelecionados.length) {
      erros.push("Selecione pelo menos um dia da semana.");
    }

    if (hora === undefined || minuto === undefined) {
      erros.push("Informe a hora do medicamento.");
    }

    if (erros.length > 0) {
      const mensagem = erros.map((e) => `• ${e}`).join("\n");
      alert(mensagem);
      return;
    }

    try {
      if (idMedicamento) {
        await update();
        console.log("Chamou update com id:", idMedicamento);
      } else {
        await insert();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar medicamento");
    } finally {
      router.back();
    }
  }

  async function update() {
    try {
      // Atualiza os dados do medicamento no banco
      await medicamentosTable.update({
        id_medicamento: Number(params.medicamento_id),
        nome_medicamento: nomeMedicamento,
        dosagem: Number(dosagem),
        medida: selectedDose,
        imagem_uri: selectedImage!,
      });

      // Buscar as notificações existentes para este medicamento
      const oldNotificacoes = await notificacoesTable.selectByMedicamentoId(
        Number(params.medicamento_id)
      );

      // Agora, vamos criar ou atualizar notificações
      for (const diaSemana of diasSelecionados) {
        // Verifica se já existe uma notificação agendada para esse dia
        const existingNotificacao = oldNotificacoes.find(
          (notificacao) => notificacao.dia === diaSemana
        );

        const now = new Date();
        const target = new Date();
        target.setHours(hora, minuto, 0, 0);

        // Calcula a diferença de dias para o próximo dia da semana selecionado
        const diff = (diaSemana + 7 - now.getDay()) % 7;
        if (diff === 0 && target <= now) {
          target.setDate(target.getDate() + 7); // Se o horário já passou, agendar para a próxima semana
        } else {
          target.setDate(target.getDate() + diff);
        }

        if (existingNotificacao) {
          // Se a notificação já existe, atualiza a notificação e os registros
          await notificacoesTable.update({
            id_notifee: existingNotificacao.id_notifee, // Atualiza a notificação existente
            id_medicamento: Number(params.medicamento_id),
            hora: `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`,
            dia: diaSemana,
          });

          // Atualiza os registros com o novo horário
          await registroTable.update(
            existingNotificacao.id_notifee, // id_notifeeAntigo
            existingNotificacao.id_notifee // id_notifeeNovo (use a novo id_notifee if changed)
          );

          // Atualizar a notificação do Notifee (caso seja necessário)
          await cancelNotification(existingNotificacao.id_notifee);
          await scheduleNotification({
            // title: `Hora do medicamento: ${nomeMedicamento}`,
            // body: `Tomar ${dosagem} ${selectedDose}`,
            timestamp: target.getTime(),
            nome_medicamento: nomeMedicamento,
            dosagem: Number(dosagem),
            medida: selectedDose,
            hora_prevista: `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`,
            imagem_uri: selectedImage!,
          });
        } else {
          // Se a notificação não existir, cria uma nova notificação
          const id_notifee = await scheduleNotification({
            // title: `Hora do medicamento: ${nomeMedicamento}`,
            // body: `Tomar ${dosagem} ${selectedDose}`,
            timestamp: target.getTime(),
            nome_medicamento: nomeMedicamento,
            dosagem: Number(dosagem),
            medida: selectedDose,
            hora_prevista: `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`,
            imagem_uri: selectedImage!,
          });

          // Cria a nova notificação no banco
          await notificacoesTable.insert({
            id_notifee,
            id_medicamento: Number(params.medicamento_id),
            hora: `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`,
            dia: diaSemana,
          });

          // Não há necessidade de atualizar os registros agora, porque eles serão criados quando o medicamento for tomado
        }
      }

      alert("Medicamento e notificações salvos!");
    } catch (error) {
      console.error("Erro ao atualizar medicamento:", error);
      throw error;
    }
  }

  async function insert() {
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
          // title: `Hora do medicamento: ${nomeMedicamento}`,
          // body: `Tomar ${dosagem} ${selectedDose}`,
          timestamp: target.getTime(),
          nome_medicamento: nomeMedicamento,
          dosagem: Number(dosagem),
          medida: selectedDose,
          hora_prevista: `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`,
          imagem_uri: selectedImage!,
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
      throw e;
    }
  }

  async function deleteById() {
    try {
      await medicamentosTable.deleteById(Number(params.medicamento_id));

      const oldNotificacoes = await notificacoesTable.selectByMedicamentoId(
        Number(params.medicamento_id)
      );

      for (const n of oldNotificacoes) {
        await cancelNotification(n.id_notifee);
      }

      await notificacoesTable.deleteByMedicamentoId(
        Number(params.medicamento_id)
      );
      alert("Medicamento deletado!");
      router.back();
    } catch (error) {
      console.log("Erro ao deletar medicamento:", error);
    }
  }

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1 px-4 bg-background pt-10">
        <ScrollView>
          <View className="flex-1">
            {/* Seletor de horário */}
            <DateTimePicker
              initialDias={diasSelecionados}
              initialHora={hora}
              initialMinuto={minuto}
              onChange={(dias, h, m) => {
                // console.log("Dias selecionados:", dias, "Hora:", h, "Minuto:", m);
                setDiasSelecionados(dias);
                setHora(h);
                setMinuto(m);
              }}
            />

            {/* Input do nome do medicamento */}
            <TextInput
              placeholder="Nome do medicamento"
              className="border-b border-card pb-3 text-main text-xl h-16"
              value={nomeMedicamento}
              onChangeText={setNomeMedicamento}
              placeholderTextColor={theme === "dark" ? "#fff" : "#1f2937"}
            />

            {/* Input + seletor de dosagem */}
            <View className="flex-row items-center space-x-4 mt-4">
              {/* Input da quantidade */}
              <TextInput
                placeholder="Dosagem"
                keyboardType="numeric"
                value={dosagem}
                onChangeText={setDosagem}
                className="flex-1 border-b border-card mr-4 pb-3 text-main text-xl h-16"
                placeholderTextColor={theme === "dark" ? "#fff" : "#1f2937"}
              />

              {/* Botão para abrir o BottomSheet */}
              <TouchableOpacity
                className="px-6 py-3 rounded-xl justify-center border border-card bg-card h-16"
                onPress={handleOpenPress}
              >
                <Text className="text-label text-center font-semibold text-lg">
                  {formatDoseName(selectedDose)}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              {selectedImage && (
                <TouchableOpacity
                  className="mt-4 items-center"
                  onPress={handleOpenImagePress} // Abre o BottomSheet ao clicar na imagem
                >
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: 150, height: 150, borderRadius: 12 }}
                    resizeMode="contain"
                  />
                  <Text className="text-label text-center text-lg mt-2">
                    Toque na imagem para visualizar.
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="flex-row items-center justify-center border border-card bg-card rounded-xl h-16 mt-4 px-4"
                onPress={pickImage}
              >
                <MaterialIcons name="image" size={24} color="#6B7280" />
                <Text className="text-label text-center font-medium text-lg ml-2">
                  {selectedImage
                    ? selectedImage.split("/").pop()
                    : "Selecionar imagem do medicamento"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botões de ação */}
          <View className="flex-row justify-between items-center py-4 px-6 border-t border-card">
            <TouchableOpacity
              className="flex-1 bg-card py-3 rounded-2xl mr-2"
              onPress={() => router.back()}
            >
              <Text className="text-center text-label font-semibold text-lg">
                Cancelar
              </Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                className="flex-1 bg-card py-3 rounded-2xl mx-2"
                onPress={deleteById}
              >
                <Text className="text-center text-label font-semibold text-lg">
                  Deletar
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="flex-1 bg-primary py-3 rounded-2xl ml-2"
              onPress={handleSubmit}
            >
              <Text className="text-center text-white font-semibold text-lg">
                Salvar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <DosagemBottomSheet
        ref={bottomSheetRef}
        onSelectDose={(dose) => {
          setSelectedDose(dose);
          bottomSheetRef.current?.close();
        }}
      />

      <ImagemBottomSheet
        ref={bottomSheetRefImage}
        imagemUri={selectedImage}
        onImageChange={(uri) => setSelectedImage(uri)} // Atualiza a imagem quando alterada
      />
    </View>
  );
}
