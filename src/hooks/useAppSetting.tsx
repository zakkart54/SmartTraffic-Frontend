import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AppSettings = {
  notificationsEnabled: boolean;
};

type SettingsContextType = {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
};

const defaultSettings: AppSettings = {
  notificationsEnabled: true
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    AsyncStorage.getItem("app_settings").then((data) => {
      if (data) setSettings(JSON.parse(data));
    });
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    AsyncStorage.setItem("app_settings", JSON.stringify(merged));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within SettingsProvider");
  return ctx;
}
