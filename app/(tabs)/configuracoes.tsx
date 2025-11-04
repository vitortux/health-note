import ThemeBottomSheet from "@/components/ThemeBottomSheet";
import { ThemeVariant, useConfig } from "@/context/ConfigContext";
import { useRegistroMedicamentosTable } from "@/hooks/useRegistroMedicamentosTable";
import { sendRelatorio } from "@/utils/emailjs";
import BottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMedicamentosTable } from "@/hooks/useMedicamentosTable";
import { useNotificacoesTable } from "@/hooks/useNotificacoesTable";
import notifee from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function getPrimaryColor(theme: ThemeVariant) {
  switch (theme) {
    case "dark":
      return "#0ea5e9";
    case "light":
      return "#0ea5e9";
    case "deuteranopia":
      return "#007acc";
    case "protanopia":
      return "#0088cc";
    case "tritanopia":
      return "#d75a00";
  }
}

export default function Configuracoes() {
  const {
    theme,
    setTheme,
    saveEmailAndName,
    setAutoSendEmails,
    autoSendEmails,
    responsavelEmail: savedEmail,
    nomeUsuario: savedNome,
  } = useConfig();

  const { gerarRelatorio } = useRegistroMedicamentosTable();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());

  const [envioAtivo, setEnvioAtivo] = useState(autoSendEmails);
  const [responsavelEmail, setResponsavelEmail] = useState(savedEmail);
  const [nomeUsuario, setNomeUsuario] = useState(savedNome);

  const [erroEmail, setErroEmail] = useState(""); // erros de configuração
  const [erroRelatorio, setErroRelatorio] = useState(""); // erros de envio manual

  const handleOpenPress = () => bottomSheetRef.current?.expand();

  const medicamentosTable = useMedicamentosTable();
  const notificacoesTable = useNotificacoesTable();
  const registrosTable = useRegistroMedicamentosTable();

  // Salvar nome e e-mail
  async function handleSubmit() {
    setErroEmail("");
    try {
      await saveEmailAndName(responsavelEmail, nomeUsuario);
      Alert.alert("Sucesso", "Configurações salvas com sucesso!");
    } catch (err: any) {
      setErroEmail(err.message || "Ocorreu um erro ao salvar.");
    }
  }

  // Toggle envio automático
  const handleToggleEnvio = async (value: boolean) => {
    setErroEmail("");
    try {
      await setAutoSendEmails(value);
      setEnvioAtivo(value);
    } catch (err: any) {
      setErroEmail(err.message);
      setEnvioAtivo(false);
    }
  };

  // Envio manual de relatório
  async function handleEnviarRelatorio() {
    const erros: string[] = [];

    if (!responsavelEmail) erros.push("Preencha o e-mail do cuidador");
    if (!nomeUsuario) erros.push("Preencha seu nome");
    if (!dataSelecionada) erros.push("Selecione uma data para o relatório");

    if (erros.length > 0) {
      setErroRelatorio(erros.join(" • "));
      return;
    }

    setErroRelatorio(""); // reset antes de enviar

    try {
      const relatorio = await gerarRelatorio(dataSelecionada);
      await sendRelatorio(
        relatorio,
        responsavelEmail,
        dataSelecionada,
        nomeUsuario
      );
      Alert.alert("Sucesso", "Relatório enviado com sucesso!");
    } catch (err) {
      console.error(err);
      setErroRelatorio("Ocorreu um problema ao enviar o relatório");
    }
  }

  async function handleClearDatabase() {
    Alert.alert(
      "Confirmação",
      "Tem certeza de que deseja limpar todos os dados do aplicativo? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel", // Cancela a ação
        },
        {
          text: "Sim, limpar",
          onPress: clearDatabase, // Chama a função de limpar os dados se o usuário confirmar
          style: "destructive", // Cor vermelha para destacar a ação destrutiva
        },
      ]
    );
  }

  async function clearDatabase() {
    try {
      // Limpa os dados do banco de dados
      await medicamentosTable.deleteAll();
      await notificacoesTable.deleteAll();
      await registrosTable.deleteAll();
      await notifee.cancelAllNotifications();

      // Limpa o AsyncStorage
      await AsyncStorage.clear();

      // Limpa o nome e e-mail no contexto
      await saveEmailAndName("", "");
      await setAutoSendEmails(false);

      setNomeUsuario("");
      setResponsavelEmail("");
      setEnvioAtivo(false);

      setTheme("light");

      // Alerta de sucesso
      Alert.alert("Sucesso", "Todos os dados foram limpos com sucesso.");

      console.log("Todos os dados foram limpos com sucesso.");
    } catch (error) {
      console.error("Erro ao limpar os dados:", error);
      // Alerta de erro
      Alert.alert("Erro", "Ocorreu um erro ao limpar os dados.");
    }
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 px-6 pt-10">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="py-[84px] mb-6 justify-center items-center">
            <Text className="text-main font-extrabold text-3xl text-center">
              Configurações do aplicativo
            </Text>
            <Text className="text-label text-lg text-center mt-2">
              Personalize seu app e preferências
            </Text>
          </View>

          {/* Switch de envio automático */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-main text-xl font-semibold flex-shrink">
              Envio automático de relatórios:
            </Text>
            <Switch
              value={envioAtivo}
              onValueChange={handleToggleEnvio}
              thumbColor={envioAtivo ? "#fff" : "#e5e7eb"}
              trackColor={{ false: "#374151", true: getPrimaryColor(theme) }}
              style={{ transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }] }}
            />
          </View>

          {/* Inputs de nome e e-mail */}
          <View>
            <View className="mb-6">
              <Text className="text-main text-xl mb-2">Seu nome:</Text>
              <TextInput
                value={nomeUsuario}
                onChangeText={setNomeUsuario}
                placeholder="Digite seu nome"
                className="border border-card rounded-xl px-4 py-3 text-main text-xl bg-card"
                placeholderTextColor={theme === "dark" ? "#fff" : "#1f2937"}
              />
            </View>

            <View className="mb-4">
              <Text className="text-main text-xl mb-2">
                E-mail do cuidador:
              </Text>
              <TextInput
                value={responsavelEmail}
                onChangeText={setResponsavelEmail}
                placeholder="Digite o e-mail do cuidador"
                className="border border-card rounded-xl px-4 py-3 text-main text-xl bg-card"
                placeholderTextColor={theme === "dark" ? "#fff" : "#1f2937"}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Label de erro unificada para configuração */}
            {erroEmail ? (
              <Text className="text-red-500 text-lg mt-1 min-h-[24px]">
                {erroEmail}
              </Text>
            ) : null}

            {/* Botão Salvar */}
            <TouchableOpacity
              className="bg-primary py-4 rounded-xl items-center justify-center mt-4"
              onPress={handleSubmit}
            >
              <Text className="text-white font-semibold text-lg">Salvar</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-label text-lg mt-6">
            Clique em salvar para aplicar.
          </Text>

          {/* Seletor de tema */}
          <View className="flex-row items-center justify-between border-t border-card pt-6 mt-6">
            <Text className="text-main text-xl">Selecionar tema:</Text>
            <TouchableOpacity
              className="px-6 py-3 rounded-xl justify-center border border-primary bg-primary h-16 min-w-[140px] max-w-[180px]"
              onPress={handleOpenPress}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Envio manual de relatório */}
          <View className="border-t border-card pt-6 mt-6">
            <Text className="text-main text-xl font-semibold mb-4">
              Envie um relatório manual:
            </Text>

            {/* Botão para selecionar data */}
            <TouchableOpacity
              className="bg-card py-3 rounded-xl items-center mb-4"
              onPress={() => setMostrarDatePicker(true)}
            >
              <Text className="text-label font-semibold text-lg">
                {dataSelecionada
                  ? `Data selecionada: ${dataSelecionada.toLocaleDateString(
                      "pt-BR"
                    )}`
                  : "Selecionar data"}
              </Text>
            </TouchableOpacity>

            {mostrarDatePicker && (
              <DateTimePicker
                value={dataSelecionada || new Date()}
                mode="date"
                display="calendar"
                onChange={(_, date) => {
                  setMostrarDatePicker(false);
                  if (date) setDataSelecionada(date);
                }}
              />
            )}

            {/* Botão para enviar relatório */}
            <TouchableOpacity
              className="bg-primary py-3 rounded-xl items-center"
              onPress={handleEnviarRelatorio}
            >
              <Text className="text-white font-semibold text-lg">
                Enviar relatório
              </Text>
            </TouchableOpacity>
          </View>

          {/* Label de erro para envio manual */}
          {erroRelatorio ? (
            <Text className="text-red-500 text-lg mt-1 min-h-[24px]">
              {erroRelatorio}
            </Text>
          ) : null}

          {/* Botão para limpar todos os dados */}
          <View className="border-t border-card pt-6 mt-6">
            <TouchableOpacity
              className="bg-red-500 py-3 rounded-xl items-center"
              onPress={handleClearDatabase}
            >
              <Text className="text-white font-semibold text-lg">
                Limpar todos os dados
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* BottomSheet de tema */}
      <Portal>
        <ThemeBottomSheet
          ref={bottomSheetRef}
          onSelectTheme={(newTheme) => {
            setTheme(newTheme as ThemeVariant);
            bottomSheetRef.current?.close();
          }}
        />
      </Portal>
    </View>
  );
}
