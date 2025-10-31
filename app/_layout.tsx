import { initialize } from "@/database/schema";

import { ThemeProvider } from "@/context/ConfigContext";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "../global.css";
import NotifeeListener from "@/components/NotifeeListener";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SQLiteProvider databaseName="app.db" onInit={initialize}>
          <NotifeeListener />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            <Stack.Screen
              name="cadastrar-medicamento/[medicamento_id]"
              options={{ headerShown: false }}
            />
          </Stack>
        </SQLiteProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
