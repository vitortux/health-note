import {
  cancelNotification,
  scheduleDailyReportNotification,
} from "@/utils/notifee";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { View } from "react-native";

export type ThemeVariant = "light" | "dark" | "high-contrast";

export interface ConfigContextProps {
  theme: ThemeVariant;
  setTheme: (newTheme: ThemeVariant) => void;
  autoSendEmails: boolean;
  setAutoSendEmails: (value: boolean) => void;
}

const ConfigContext = createContext<ConfigContextProps>({
  theme: "light",
  setTheme: () => {},
  autoSendEmails: false,
  setAutoSendEmails: () => {},
} as ConfigContextProps);

export const useConfig = (): ConfigContextProps => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ConfigProviderProps) => {
  const [theme, setTheme] = useState<ThemeVariant>("light");
  const [autoSendEmails, setAutoSendEmails] = useState(true);

  useEffect(() => {
    async function loadTheme() {
      const storedTheme = (await AsyncStorage.getItem("theme")) as ThemeVariant;
      const storedAutoSend = await AsyncStorage.getItem("autoSendEmails");

      if (storedTheme) {
        setTheme(storedTheme);
      }

      if (storedAutoSend) {
        setAutoSendEmails(storedAutoSend === "true");
        if (storedAutoSend === "true") await scheduleDailyReportNotification();
      } else if (autoSendEmails) {
        await scheduleDailyReportNotification();
      }
    }

    loadTheme();
  }, []);

  async function setThemeAndSave(newTheme: ThemeVariant) {
    setTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  }

  async function setAutoSendEmailsAndSave(value: boolean) {
    setAutoSendEmails(value);
    await AsyncStorage.setItem("autoSendEmails", value.toString());

    if (value) {
      await scheduleDailyReportNotification();
    } else {
      await cancelNotification("auto_email_report");
    }
  }

  const contextValue: ConfigContextProps = {
    theme,
    autoSendEmails,
    setTheme: setThemeAndSave,
    setAutoSendEmails: setAutoSendEmailsAndSave,
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      <View className={`flex-1 ${theme}`}>{children}</View>
    </ConfigContext.Provider>
  );
};
