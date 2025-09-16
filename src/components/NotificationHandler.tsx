import { useEffect } from "react";
import * as Location from "expo-location";
import { useNotification } from "../hooks/useNotification";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationHandler() {
  const { getNotificationUsingGps } = useNotification();
  const {accessToken} = useAuth();

  useEffect(() => {
    if (!accessToken) return;
    let subscription: Location.LocationSubscription;
    let intervalId: NodeJS.Timeout | null = null;
    let latestCoords: { latitude: number; longitude: number } | null = null;
    const INTERVAL_MS = 300000;

    const callNotiApi = () => {
      if (!latestCoords) return;
      getNotificationUsingGps(latestCoords.latitude, latestCoords.longitude)
        .catch(err => console.error("Notification API error:", err));
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
          distanceInterval: 500,
          timeInterval: 60000,
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
  }, [getNotificationUsingGps]);
  return null;
}
