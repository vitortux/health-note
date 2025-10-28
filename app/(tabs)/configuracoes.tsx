import { ThemeVariant, useConfig } from "@/context/ConfigContext";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Configuracoes() {
  const { theme, setTheme } = useConfig();

  // Lista de todos os temas disponíveis
  const themes: ThemeVariant[] = ["light", "dark", "high-contrast"];

  // Calcula o próximo tema
  const currentIndex = themes.indexOf(theme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];

  return (
    <SafeAreaView className="flex-1 bg-background-base">
      <View className="p-4 m-4 border border-primary rounded-md">
        <Text className="text-main text-lg font-bold">Título Tematizado</Text>
        <Text className="text-secondary mt-2">
          Cor secundária para destaque
        </Text>
      </View>

      <View className="m-4">
        <TouchableOpacity
          className="bg-primary py-3 px-4 rounded-md items-center"
          onPress={() => setTheme(nextTheme)}
        >
          <Text className="text-main font-bold">Mudar para {nextTheme}</Text>
        </TouchableOpacity>
      </View>

      <View className="m-4">
        <Text className="text-main">Tema atual: {theme}</Text>
      </View>
    </SafeAreaView>
  );
}
