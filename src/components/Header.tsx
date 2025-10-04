import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Modal, Pressable } from "react-native";
import { router } from "expo-router";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppLogo from "../components/AppLogo";
import { useTheme } from "@/hooks/useTheme";
import {useAuth} from "../hooks/useAuth";
import NotificationDropdown from "../components/NotificationDropdown";
import { useNotification } from "@/hooks/useNotification";
import { Notification } from "../hooks/useNotification";
import { useUser, UserProfile } from "@/hooks/useUser";

interface Props {
  status?: any[];
  hideMenu?: boolean;
}

export default function Header({ hideMenu= false }: Props) {
  const { accessToken, logout } = useAuth();
  const { getUserProfile } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const {getNotificationByUser, processNotifications, markNotificationsAsRead} = useNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!accessToken) {
      setProfile(null);
      return;
    }
    (async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    })();
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    const fetchNotifications = async () => {
      try {
        const data = await getNotificationByUser();
        const {hasUnread, notifications} = await processNotifications(data as any);
        setNotifications(notifications);
        setHasUnread(hasUnread);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  const handleOpenNotificationMenu = () => {
    setNotifVisible(true);
    if (hasUnread) {
      markNotificationsAsRead(notifications).then(() => setHasUnread(false));
    }
  }
  
  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    router.replace("/Login");
  };

  const handleLogin = () => {
    setMenuVisible(false);  
    router.push("/Login");
  };

  const handleViewInfo = () => {
    setMenuVisible(false);
    router.push("/SubmittedReportView");
  };

  const handleSettings = () => {
    setMenuVisible(false);
    router.push("/Settings");
  };

  const openStatus = (status) => {
    setNotifVisible(false);
  //   router.push({
  //     pathname: "/DetailStatus",
  //     params: { status: JSON.stringify(status) },
  //   });
  };

  // const reliabilityClass = (rel: string) => {
  //   const v = parseInt(rel);
  //   if (v >= 80) return "text-green-600";
  //   if (v >= 50) return "text-yellow-500";
  //   return "text-red-600";
  // };

  return (
    <View className={theme === "dark" ? "bg-[#063970]" : "bg-[#b6d2fe]"}>
      <View className="mt-16">
          <AppLogo imageWidth={80} imageMarginRight={5} height={50}/>
      </View>
      {!hideMenu && (
        <View className="flex-row items-center justify-between bg-[#edf2fc] px-4 py-5  mt-4">
          <Text className="text-[#063970] text-xl font-semibold">
            Xin chào, {accessToken ? profile?.username || "User" : "User"}
            </Text>
          <View className="flex-row items-center space-x-4">
            {/* Bell */}
            <TouchableOpacity onPress={() => handleOpenNotificationMenu()} className="relative mr-4">
              <Image
                source={require("../asset/icons/bell.png")}
                className="h-7 w-7 tint-white"
                resizeMode="contain"
              />
                {hasUnread && (
                  <MaterialIcons
                    name="fiber-manual-record"
                    size={10}
                    color="red"
                    style={{ position: 'absolute', top: -2, right: -2 }}
                  />
                )}
            </TouchableOpacity>
          
            {/* Menu */}
            <TouchableOpacity onPress={() => setMenuVisible(true)} className="flex-row items-center">
              <Image
                source={require("../asset/icons/menu.png")}
                className="h-7 w-7 tint-white"
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Modal
              transparent
              animationType="fade"
              visible={menuVisible}
              onRequestClose={() => setMenuVisible(false)}
            >
              <Pressable
                onPress={() => setMenuVisible(false)}
                className="flex-1 justify-start items-end pt-40 mt-4 bg-transparent"
              >
                <View className="bg-white rounded-md shadow-lg p-2 mr-2 w-40 mt-2">
                  {accessToken && (
                    <TouchableOpacity onPress={handleViewInfo} className="py-2">
                      <Text className="text-black">Xem thông tin</Text>
                    </TouchableOpacity>
                    )
                  }
                  <TouchableOpacity onPress={handleSettings} className="py-2">
                    <Text className="text-black">Cài đặt</Text>
                  </TouchableOpacity>
                  {accessToken ? (
                    <TouchableOpacity onPress={handleLogout} className="py-2">
                      <Text className="text-red-600">Đăng xuất</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={handleLogin} className="py-2">
                      <Text className="text-red-600">Đăng nhập</Text>
                    </TouchableOpacity>
                  )
                    }
                  {/* <View className="flex-row items-center py-2">
                    <TouchableOpacity
                      onPress={() => setTheme("light")}
                      className={`w-5 h-5 rounded-full mr-2 border-2 ${
                        theme === "light"
                          ? "bg-blue-300 border-blue-400"
                          : "border-gray-400"
                      }`}
                    />
                    <Text className="text-black mr-4">Sáng</Text>
                    <TouchableOpacity
                      onPress={() => setTheme("dark")}
                      className={`w-5 h-5 rounded-full mr-2 border-2 ${
                        theme === "dark"
                          ? "bg-blue-800 border-blue-600"
                          : "border-gray-400"
                      }`}
                    />
                    <Text className="text-black">Tối</Text>
                  </View> */}
                </View>
              </Pressable>
            </Modal>

            <NotificationDropdown
              visible={notifVisible}
              onClose={() => setNotifVisible(false)}
              notifications={notifications}
              onOpenStatus={openStatus}
            />
          </View>
        </View>)}
    </View>
  );
}
