import { ThemeVariant, useConfig } from "@/context/ConfigContext";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { ContributionGraph } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Configuracoes() {
  const { theme, setTheme } = useConfig();

  // Lista de todos os temas disponíveis
  const themes: ThemeVariant[] = [
    "light",
    "dark",
    "deuteranopia",
    "protanopia",
    "tritanopia",
  ];

  // Calcula o próximo tema
  const currentIndex = themes.indexOf(theme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];

  const commitsData = [
    { date: "2017-01-02", count: 1 },
    { date: "2017-01-03", count: 2 },
    { date: "2017-01-04", count: 3 },
    { date: "2017-01-05", count: 4 },
    { date: "2017-01-06", count: 5 },
    { date: "2017-01-30", count: 2 },
    { date: "2017-01-31", count: 3 },
    { date: "2017-03-01", count: 2 },
    { date: "2017-04-02", count: 4 },
    { date: "2017-03-05", count: 2 },
    { date: "2017-02-30", count: 4 },
  ];

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    useShadowColorFromDataset: false,
    propsForLabels: {
      fontSize: 16, // aumenta o tamanho do texto
      fontWeight: "bold", // opcional
      fill: "#333333", // cor do texto
    },
  };

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

      <ContributionGraph
        values={commitsData}
        endDate={new Date()}
        numDays={90} // últimos 3 meses
        width={Dimensions.get("window").width - 32}
        height={220}
        chartConfig={chartConfig}
      />
    </SafeAreaView>
  );
}
