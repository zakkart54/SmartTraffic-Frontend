import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { useNotification } from "../hooks/useNotification";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/hooks/useAppSetting";
import * as Notifications from "expo-notifications";
import {usePushNotification} from "@/hooks/usePushNotification";

export default function NotificationHandler() {
  const { getNotificationUsingGps } = useNotification();
  const { accessToken } = useAuth();
  const { settings } = useAppSettings();
  const lastNotiRef = useRef<string | null>(null);
  const { scheduleLocalNotification } = usePushNotification();

  useEffect(() => {
    if (!accessToken || !settings.notificationsEnabled) return;

    let subscription: Location.LocationSubscription;
    let intervalId: NodeJS.Timeout | null = null;
    let latestCoords: { latitude: number; longitude: number } | null = null;

    const INTERVAL_MS = (settings.notifInterval ?? 5) * 60 * 1000;

    const callNotiApi = async () => {
      if (!latestCoords) return;
      try {
        const res = await getNotificationUsingGps(
          latestCoords.latitude,
          latestCoords.longitude
        );
    
        const notis: any[] = Array.isArray(res?.[0]) ? res[0] : [];
    
        for (const n of notis) {
          if (n?.content) {
            if (lastNotiRef.current !== n.content) {
              lastNotiRef.current = n.content;
              scheduleLocalNotification("Cảnh báo giao thông", n.content);
            }
          }
        }
      } catch (err) {
        console.error("Notification API error:", err);
      }
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
