import { ThemeProvider } from "@/context/ConfigContext";
import { initialize } from "@/database/schema";
import { PortalProvider } from "@gorhom/portal";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import NotifeeListener from "@/components/NotifeeListener";
import "../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <ThemeProvider>
          <PortalProvider>
            <SQLiteProvider databaseName="app.db" onInit={initialize}>
              <NotifeeListener />
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="+not-found"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="cadastrar-medicamento/[medicamento_id]"
                  options={{ headerShown: false }}
                />
              </Stack>
            </SQLiteProvider>
          </PortalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
