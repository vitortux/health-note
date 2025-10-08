import { initialize } from "@/database/schema";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import "../global.css";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="app.db" onInit={initialize}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        <Stack.Screen name="/details/[medicamento_id]" />
      </Stack>
    </SQLiteProvider>
  );
}
