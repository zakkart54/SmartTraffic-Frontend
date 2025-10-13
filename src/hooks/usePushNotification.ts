import { useEffect, useState, useRef } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotification() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Không có quyền thông báo!");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
    })();
    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // console.log("User tapped notification:", response.notification);
        router.replace("/Maps");
      }
    );

    return () => {
        responseListener.current?.remove();
    };
  }, []);

  const scheduleLocalNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  };

  return { expoPushToken, scheduleLocalNotification };
}
