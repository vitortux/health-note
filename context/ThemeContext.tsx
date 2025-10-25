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

export interface ThemeContextProps {
  theme: ThemeVariant;
  setTheme: (newTheme: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  setTheme: () => {},
} as ThemeContextProps);

export const useTheme = (): ThemeContextProps => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeVariant>("light");

  useEffect(() => {
    async function loadTheme() {
      const stored = (await AsyncStorage.getItem("theme")) as ThemeVariant;

      if (stored) {
        setTheme(stored);
      }
    }

    loadTheme();
  }, []);

  async function setThemeAndSave(newTheme: ThemeVariant) {
    setTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  }

  const contextValue: ThemeContextProps = {
    theme,
    setTheme: setThemeAndSave,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <View className={`flex-1 ${theme}`}>{children}</View>
    </ThemeContext.Provider>
  );
};
