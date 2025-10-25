import { ThemeProvider } from "@/context/ThemeContext";
import { initialize } from "@/database/schema";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import "../global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SQLiteProvider databaseName="app.db" onInit={initialize}>
        <StatusBar style="dark" />
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
  );
}
