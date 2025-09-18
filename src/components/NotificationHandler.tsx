import { useEffect } from "react";
import * as Location from "expo-location";
import { useNotification } from "../hooks/useNotification";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/hooks/useAppSetting";

export default function NotificationHandler() {
  const { getNotificationUsingGps } = useNotification();
  const { accessToken } = useAuth();
  const { settings } = useAppSettings();

  useEffect(() => {
    if (!accessToken || !settings.notificationsEnabled) return;

    let subscription: Location.LocationSubscription;
    let intervalId: NodeJS.Timeout | null = null;
    let latestCoords: { latitude: number; longitude: number } | null = null;

    const INTERVAL_MS = (settings.notifInterval ?? 5) * 60 * 1000;

    const callNotiApi = () => {
      if (!latestCoords) return;
      getNotificationUsingGps(latestCoords.latitude, latestCoords.longitude)
        .catch((err) => console.error("Notification API error:", err));
    };

    const resetInterval = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(callNotiApi, INTERVAL_MS);
    };

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      latestCoords = current.coords;

      callNotiApi();
      resetInterval();

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: settings.moveDistance ?? 500,
          timeInterval: ((settings.notifInterval ?? 1) * 60 * 1000)
        },
        (loc) => {
          latestCoords = loc.coords;
          callNotiApi();
          resetInterval();
        }
      );
    })();

    return () => {
      subscription?.remove();
      if (intervalId) clearInterval(intervalId);
    };
  }, [accessToken, settings, getNotificationUsingGps]);
  return null;
}
