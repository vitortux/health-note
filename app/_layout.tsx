import { initialize } from "@/database/schema";

import notifee, { EventType } from "@notifee/react-native";

import { ThemeProvider, useConfig } from "@/context/ConfigContext";
import { sendRelatorio } from "@/utils/emailjs";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect } from "react";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  useEffect(() => {
    return notifee.onForegroundEvent(async ({ type, detail }) => {
      const notificationId = detail.notification?.id;

      switch (type) {
        case EventType.DELIVERED:
          if (notificationId === "auto_send_email") {
            // sendRelatorio();
            console.log("Vamos poupar e-mails");
          }
          break;
        case EventType.DISMISSED:
          console.log(
            "🗑️ Usuário descartou a notificação",
            detail.notification
          );
          break;
        case EventType.PRESS:
          console.log(
            "👆 Usuário pressionou a notificação",
            detail.notification
          );
          break;
      }
    });
  }, []);

  useEffect(() => {
    return notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log("Usuário pressionou a notificação", detail.notification);
      }
    });
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SQLiteProvider databaseName="app.db" onInit={initialize}>
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
