import {
  cancelNotification,
  scheduleDailyComputeNotification,
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
  clearEmailAndName: () => void;
}

const ConfigContext = createContext<ConfigContextProps>({
  theme: "light",
  setTheme: () => {},
  autoSendEmails: false,
  setAutoSendEmails: () => {},
  responsavelEmail: "",
  nomeUsuario: "",
  saveEmailAndName: () => {},
  clearEmailAndName: () => {},
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

        if (storedTheme === "dark") setStatusBarStyle("light", false);
        else setStatusBarStyle("dark", false);
      }

      const autoSend = storedAutoSend === "true";
      setAutoSendEmails(autoSend);

      if (autoSend) {
        await scheduleDailyReportNotification(); // agenda envio de relatório
        await cancelNotification("auto_compute_registros"); // garante que a outra não fique ativa
      } else {
        await scheduleDailyComputeNotification(); // agenda apenas contabilização
        await cancelNotification("auto_send_email"); // garante que a de e-mail não fique ativa
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
    if (!value) {
      setAutoSendEmails(false);
      await AsyncStorage.setItem("autoSendEmails", "false");
      await cancelNotification("auto_send_email");
      await scheduleDailyComputeNotification();
      return;
    }

    const email = responsavelEmail.trim();
    const nome = nomeUsuario.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      throw new Error(
        "É necessário cadastrar um e-mail válido antes de ativar o envio automático."
      );
    }

    if (!nome) {
      throw new Error(
        "É necessário cadastrar o nome do usuário antes de ativar o envio automático."
      );
    }

    setAutoSendEmails(true);
    await AsyncStorage.setItem("autoSendEmails", "true");
    await cancelNotification("auto_compute_registros");
    await scheduleDailyReportNotification();
  }

  async function saveEmailAndName(email: string, nome: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.trim() && !emailRegex.test(email)) {
      throw new Error("E-mail inválido");
    }

    if (!nome) {
      throw new Error(
        "É necessário cadastrar o nome do usuário antes de ativar o envio automático."
      );
    }

    setResponsavelEmail(email);
    setNomeUsuario(nome);

    await AsyncStorage.setItem("responsavelEmail", email);
    await AsyncStorage.setItem("nomeUsuario", nome);
  }

  async function clearEmailAndName() {
    setResponsavelEmail("");
    setNomeUsuario("");

    await AsyncStorage.removeItem("responsavelEmail");
    await AsyncStorage.removeItem("nomeUsuario");
  }

  const contextValue: ConfigContextProps = {
    theme,
    autoSendEmails,
    setTheme: setThemeAndSave,
    setAutoSendEmails: setAutoSendEmailsAndSave,
    responsavelEmail,
    nomeUsuario,
    saveEmailAndName,
    clearEmailAndName,
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      <View className={`flex-1 ${theme}`}>{children}</View>
    </ConfigContext.Provider>
  );
};
