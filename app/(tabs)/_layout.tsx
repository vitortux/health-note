import { useConfig } from "@/context/ConfigContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { theme } = useConfig();
  const insets = useSafeAreaInsets();

  const colors = (() => {
    switch (theme) {
      case "light":
        return {
          active: "#0ea5e9",
          inactive: "#9ca3af",
          background: "#ffffff",
        };
      case "dark":
        return {
          active: "#0ea5e9",
          inactive: "#d1d5db",
          background: "#000000",
        };
      case "deuteranopia":
        return {
          active: "#007acc", // Azul seguro (em vez de verde)
          inactive: "#999999",
          background: "#ffffff",
        };
      case "protanopia":
        return {
          active: "#0088cc", // Verde-azulado mais neutro
          inactive: "#aaaaaa",
          background: "#ffffff",
        };
      case "tritanopia":
        return {
          active: "#d75a00", // Laranja visível pra quem tem tritanopia
          inactive: "#888888",
          background: "#ffffff",
        };
    }
  })();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notificacoes"
        options={{
          headerShown: false,
          tabBarLabel: "Hoje",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          headerShown: false,
          tabBarLabel: "Histórico",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "time-sharp" : "time-outline"} // ícone de histórico
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="debug"
        options={{
          headerShown: false,
          tabBarLabel: "Debug",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "code-slash" : "code-outline"}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          headerShown: false,
          tabBarLabel: "Configurações",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={20}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
