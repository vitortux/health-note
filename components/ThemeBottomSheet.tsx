import { useConfig } from "@/context/ConfigContext";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Ref = BottomSheet;

interface ThemeBottomSheetProps {
  onSelectTheme: (theme: string) => void;
}

const themes = [
  { name: "light", label: "Claro", icon: "wb-sunny" },
  { name: "dark", label: "Escuro", icon: "nights-stay" },
  { name: "deuteranopia", label: "Deuteranopia", icon: "visibility" },
  { name: "protanopia", label: "Protanopia", icon: "visibility" },
  { name: "tritanopia", label: "Tritanopia", icon: "visibility" },
];

const ThemeOption = ({
  name,
  label,
  icon,
  selected,
  onPress,
}: {
  name: string;
  label: string;
  icon: string;
  selected?: boolean;
  onPress?: () => void;
}) => {
  const { theme } = useConfig(); // <-- Aqui você pega o theme

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center py-4 px-2 border-b border-secondary ${
        selected ? "bg-primary/10" : "bg-card"
      }`}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name={icon as any}
        size={22}
        color={(() => {
          switch (theme) {
            case "light":
            case "dark":
              return "#0ea5e9";
            case "deuteranopia":
              return "#007acc";
            case "protanopia":
              return "#0088cc";
            case "tritanopia":
              return "#d75a00";
            default:
              return "#0ea5e9";
          }
        })()}
      />

      <Text
        className={`text-lg ml-3 ${
          selected ? "text-primary font-semibold" : "text-label"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const ThemeBottomSheet = forwardRef<Ref, ThemeBottomSheetProps>(
  function ThemeBottomSheet({ onSelectTheme }, ref) {
    const { theme } = useConfig();
    const snapPoints = useMemo(() => ["25%", "50%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          {...props}
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
        }}
        handleIndicatorStyle={{
          backgroundColor: theme === "dark" ? "#fff" : "#000",
        }}
      >
        <BottomSheetView className="flex-1 px-6 pt-6 bg-card">
          <Text className="text-2xl font-semibold mb-6 text-center text-main">
            Escolher tema
          </Text>

          <View>
            {themes.map((t) => (
              <ThemeOption
                key={t.name}
                {...t}
                selected={theme === t.name}
                onPress={() => onSelectTheme(t.name)}
              />
            ))}
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default ThemeBottomSheet;
