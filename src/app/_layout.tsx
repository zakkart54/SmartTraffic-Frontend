  import "../global.css";
  import React, {useEffect} from "react";
  import { Slot } from "expo-router";
  import { AuthProvider } from "../hooks/useAuth";
  import { ThemeProvider } from "../hooks/useTheme";
  import { SettingsProvider } from "@/hooks/useAppSetting";
  import * as Notifications from "expo-notifications";
  import NotificationHandler from "@/components/NotificationHandler";
  import { router } from "expo-router";

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  export default function Layout() {
    useEffect(() => {
      (async () => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          await Notifications.requestPermissionsAsync();
        }
      })();
  
      const sub = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          // console.log("User tapped notification:", response.notification);
          router.replace("/Map");
        }
      );
      return () => {
        sub.remove();
      };
    }, []);

    return (
      <AuthProvider>
        <SettingsProvider>
          <ThemeProvider>
            <NotificationHandler />
            <Slot />
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    );
  }