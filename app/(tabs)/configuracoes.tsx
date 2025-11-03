import ThemeBottomSheet from "@/components/ThemeBottomSheet";
import { ThemeVariant, useConfig } from "@/context/ConfigContext";
import { useRegistroMedicamentosTable } from "@/hooks/useRegistroMedicamentosTable";
import BottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useRef, useState } from "react";
import {
  Alert,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const [dataSelecionada, setDataSelecionada] = useState(new Date());

  const [envioAtivo, setEnvioAtivo] = useState(autoSendEmails);
  const [responsavelEmail, setResponsavelEmail] = useState(savedEmail);
  const [nomeUsuario, setNomeUsuario] = useState(savedNome);
  const [erroEmail, setErroEmail] = useState("");

  const handleOpenPress = () => bottomSheetRef.current?.expand();

  async function handleSubmit() {
    try {
      setErroEmail("");
      await saveEmailAndName(responsavelEmail, nomeUsuario);

      // Se switch estava ligado e agora temos dados válidos, mantém
      if (envioAtivo && responsavelEmail && nomeUsuario) {
        setAutoSendEmails(true);
      }

      Alert.alert("Sucesso", "Configurações salvas com sucesso!");
    } catch (error: any) {
      setErroEmail(error.message || "Ocorreu um erro ao salvar.");
    }
  }

  const handleToggleEnvio = (value: boolean) => {
    // Só permite ativar o envio automático se nome e e-mail estiverem preenchidos
    if (value && (!responsavelEmail || !nomeUsuario)) {
      Alert.alert(
        "Atenção",
        "Preencha nome e e-mail antes de ativar o envio automático."
      );
      return;
    }

    setEnvioAtivo(value);
    if (!value) setAutoSendEmails(false);
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 px-6 pt-10">
        {/* Header */}
        <View className="py-[84px] mb-6 justify-center items-center">
          <Text className="text-main font-extrabold text-3xl text-center">
            Configurações do aplicativo
          </Text>
          <Text className="text-label text-lg text-center mt-2">
            Personalize seu app e preferências
          </Text>
        </View>

        {/* Linha com label + switch */}
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
            <Text className="text-main text-xl mb-2">E-mail do cuidador:</Text>
            <TextInput
              value={responsavelEmail}
              onChangeText={setResponsavelEmail}
              placeholder="Digite o e-mail do cuidador"
              className="border border-card rounded-xl px-4 py-3 text-main text-xl bg-card"
              placeholderTextColor={theme === "dark" ? "#fff" : "#1f2937"}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {erroEmail ? (
              <Text className="text-red-500 text-sm mt-1 min-h-[24px]">
                {erroEmail}
              </Text>
            ) : null}
          </View>

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
