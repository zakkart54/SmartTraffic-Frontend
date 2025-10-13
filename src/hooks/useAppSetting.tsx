import { createContext, useContext, useState, useEffect } from "react";
import { Alert, Linking } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';
import { set } from "zod";

type AppSettings = {
  notificationsEnabled: boolean;
  notifInterval: number;
  moveDistance: number;
  watchLocationEnabled?: boolean;
};

type SettingsContextType = {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleWatchLocation: (enabled: boolean) => void;
  setLocation: React.Dispatch<any>,
  location: any;
};

const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  notifInterval: 30,
  moveDistance: 500,
  watchLocationEnabled: true
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [location, setLocation] = useState(null);
  const [subscriber, setSubscriber] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("app_settings").then((data) => {
      if (data) {
        const saved = JSON.parse(data);
        setSettings({ ...defaultSettings, ...saved });
      }
    });
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    AsyncStorage.setItem("app_settings", JSON.stringify(merged));
  };

  const toggleWatchLocation = async (enabled: boolean) => {
    if (!enabled) setLocation(null);
    if (subscriber) {
      subscriber.remove();
      setSubscriber(null);
    }

    setSettings((prev) => ({ ...prev, watchLocationEnabled: enabled }));
    AsyncStorage.setItem(
      'app_settings',
      JSON.stringify({ ...settings, watchLocationEnabled: enabled })
    );

    if (enabled) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền bị từ chối',
          'Không thể truy cập GPS. Vui lòng kiểm tra cài đặt quyền ứng dụng và bật quyền truy cập vị trí.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 100,
          timeInterval: 10000
        },
        (pos) => {
          const coords = [
            parseFloat(pos.coords.latitude.toFixed(6)),
            parseFloat(pos.coords.longitude.toFixed(6)),
          ];
          setLocation(coords);
        }
      );

      setSubscriber(sub);
    }
  };

  useEffect(() => {
    if (settings.watchLocationEnabled) {
      toggleWatchLocation(true);
    }
    return () => {
      subscriber?.remove();
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, location, setLocation, toggleWatchLocation }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used within SettingsProvider");
  return ctx;
}
