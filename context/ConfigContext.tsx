import {
  cancelNotification,
  scheduleDailyReportNotification,
} from "@/utils/notifee";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setStatusBarStyle } from "expo-status-bar";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { View } from "react-native";

export type ThemeVariant =
  | "light"
  | "dark"
  | "deuteranopia"
  | "protanopia"
  | "tritanopia";

export interface ConfigContextProps {
  theme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
  autoSendEmails: boolean;
  setAutoSendEmails: (value: boolean) => void;
  responsavelEmail: string;
  nomeUsuario: string;
  saveEmailAndName: (email: string, nome: string) => void;
}

const ConfigContext = createContext<ConfigContextProps>({
  theme: "light",
  setTheme: () => {},
  autoSendEmails: false,
  setAutoSendEmails: () => {},
  responsavelEmail: "",
  nomeUsuario: "",
  saveEmailAndName: () => {},
});

export const useConfig = (): ConfigContextProps => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ConfigProviderProps) => {
  const [theme, setTheme] = useState<ThemeVariant>("light");
  const [autoSendEmails, setAutoSendEmails] = useState(false);
  const [responsavelEmail, setResponsavelEmail] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");

  useEffect(() => {
    async function loadConfig() {
      const storedTheme = (await AsyncStorage.getItem("theme")) as ThemeVariant;
      const storedAutoSend = await AsyncStorage.getItem("autoSendEmails");
      const email = await AsyncStorage.getItem("responsavelEmail");
      const nome = await AsyncStorage.getItem("nomeUsuario");

      if (email) setResponsavelEmail(email);
      if (nome) setNomeUsuario(nome);

      if (storedTheme) {
        setTheme(storedTheme);

        if (storedTheme === "dark") {
          setStatusBarStyle("light", false);
        } else if (storedTheme === "light") {
          setStatusBarStyle("dark", false);
        } else if (storedTheme === "deuteranopia") {
          setStatusBarStyle("dark", false);
        } else if (storedTheme === "protanopia") {
          setStatusBarStyle("dark", false);
        } else if (storedTheme === "tritanopia") {
          setStatusBarStyle("dark", false);
        }
      }

      if (storedAutoSend) {
        setAutoSendEmails(storedAutoSend === "true");
        if (storedAutoSend === "true") await scheduleDailyReportNotification();
      } else if (autoSendEmails) {
        await scheduleDailyReportNotification();
      }
    }

    loadConfig();
  }, []);

  async function setThemeAndSave(newTheme: ThemeVariant) {
    setTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      setStatusBarStyle("light", true);
    } else if (newTheme === "light") {
      setStatusBarStyle("dark", true);
    } else if (newTheme === "deuteranopia") {
      setStatusBarStyle("dark", false);
    } else if (newTheme === "protanopia") {
      setStatusBarStyle("dark", false);
    } else if (newTheme === "tritanopia") {
      setStatusBarStyle("dark", false);
    }
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

  async function saveEmailAndName(email: string, nome: string) {
    if (!email || !nome) throw new Error("Nome e e-mail são obrigatórios");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error("E-mail inválido");

    setResponsavelEmail(email);
    setNomeUsuario(nome);

    await AsyncStorage.setItem("responsavelEmail", email);
    await AsyncStorage.setItem("nomeUsuario", nome);
  }

  const contextValue: ConfigContextProps = {
    theme,
    autoSendEmails,
    setTheme: setThemeAndSave,
    setAutoSendEmails: setAutoSendEmailsAndSave,
    responsavelEmail,
    nomeUsuario,
    saveEmailAndName,
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      <View className={`flex-1 ${theme}`}>{children}</View>
    </ConfigContext.Provider>
  );
};
