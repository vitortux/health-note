import ThemeBottomSheet from "@/components/ThemeBottomSheet";
import { ThemeVariant, useConfig } from "@/context/ConfigContext";
import BottomSheet from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { useEffect, useRef, useState } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Configuracoes() {
  const { theme, setTheme } = useConfig();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [envioAtivo, setEnvioAtivo] = useState(false);
  const [responsavelEmail, setResponsavelEmail] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");

  const handleOpenPress = () => bottomSheetRef.current?.expand();

  const [erroEmail, setErroEmail] = useState("");

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

  useEffect(() => {
    if (envioAtivo && responsavelEmail) {
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsavelEmail);
      setErroEmail(emailValido ? "" : "E-mail inválido");
    } else {
      setErroEmail("");
    }
  }, [responsavelEmail, envioAtivo]);

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 px-6 pt-10">
        {/* Linha com label + switch */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-main text-xl font-semibold flex-shrink">
            Envio automático de relatórios:
          </Text>
          <Switch
            value={envioAtivo}
            onValueChange={setEnvioAtivo}
            thumbColor={envioAtivo ? "#fff" : "#e5e7eb"}
            trackColor={{ false: "#374151", true: getPrimaryColor(theme) }}
            style={{ transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }] }}
          />
        </View>

        {/* Inputs sempre visíveis, mas desabilitados se envioAtivo for false */}
        <View
          style={{
            opacity: envioAtivo ? 1 : 0.5,
          }}
        >
          <View className="mb-6">
            <Text className="text-main text-xl mb-2">Seu nome:</Text>
            <TextInput
              value={nomeUsuario}
              onChangeText={setNomeUsuario}
              placeholder="Digite seu nome"
              editable={envioAtivo}
              selectTextOnFocus={envioAtivo}
              className="border border-card rounded-xl px-4 py-3 text-main text-xl bg-card"
              placeholderTextColor={theme === "dark" ? "#fff" : "#1f2937"}
            />
          </View>

          <View className="mb-2">
            <Text className="text-main text-xl mb-2">E-mail do cuidador:</Text>
            <TextInput
              value={responsavelEmail}
              onChangeText={setResponsavelEmail}
              placeholder="Digite o e-mail do cuidador"
              editable={envioAtivo}
              selectTextOnFocus={envioAtivo}
              className="border border-card rounded-xl px-4 py-3 text-main text-xl bg-card"
              placeholderTextColor={theme === "dark" ? "#fff" : "#1f2937"}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text className="text-red-500 text-sm mt-1 min-h-[24px]">
              {erroEmail || ""}
            </Text>
          </View>
        </View>

        {/* Seletor de tema */}
        <View className="flex-row items-center justify-between mt-10">
          <Text className="text-main text-xl">
            Selecionar tema do aplicativo:
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-xl justify-center border border-primary bg-primary h-16"
            onPress={handleOpenPress}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

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
