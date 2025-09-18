// hooks/useTheme.tsx
import React, { createContext, useContext, useState } from "react";

type ThemeType = "light" | "dark";

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  inputBg: string;
  buttonBg: string;
  buttonText: string;
}

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  background: "#b6d2fe",
  card: "#fff",
  text: "#000",
  textSecondary: "#4B5563",
  border: "#D1D5DB",
  inputBg: "#F3F4F6",
  buttonBg: "#3B82F6",
  buttonText: "#fff",
};

const darkColors: ThemeColors = {
  background: "#05416C",
  card: "#1E293B",
  text: "#fff",
  textSecondary: "#CBD5E1",
  border: "#334155",
  inputBg: "#0F172A",
  buttonBg: "#3B82F6",
  buttonText: "#fff",
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>("light");
  const colors = theme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
