import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal, Pressable } from "react-native";
import { router } from "expo-router";
import AppLogo from "../components/AppLogo";
import { useTheme } from "@/hooks/useTheme";
import {useAuth} from "../hooks/useAuth";

interface Status {
  name: string;
  time: string;
  reliability: string;
  text?: string;
  description?: string;
  location: {
    longitude: string;
    latitude: string;
    longitudeDir: string;
    latitudeDir: string;
    street: string;
  };
}

interface Props {
  userName?: string;
  status?: Status[];
  unreadCount?: number;
  hideMenu?: boolean;
}

export default function Header({ userName = "User", status = [], unreadCount = 0, hideMenu= false }: Props) {
  const { accessToken, logout } = useAuth();
  userName = userName || "User";
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  
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

  const openStatus = (status: Status) => {
    setNotifVisible(false);
    router.push({
      pathname: "/DetailStatus",
      params: { status: JSON.stringify(status) },
    });
  };

  const reliabilityClass = (rel: string) => {
    const v = parseInt(rel);
    if (v >= 80) return "text-green-600";
    if (v >= 50) return "text-yellow-500";
    return "text-red-600";
  };

  const { theme } = useTheme();

  return (
    <View className={theme === "dark" ? "bg-[#063970]" : "bg-[#b6d2fe]"}>
      <View className="mt-16">
          <AppLogo imageWidth={80} imageMarginRight={5} height={50}/>
      </View>
      {!hideMenu && (
        <View className="flex-row items-center justify-between bg-[#edf2fc] px-4 py-5  mt-4">
          <Text className="text-[#063970] text-xl font-semibold">Xin chào, {userName}</Text>
          <View className="flex-row items-center space-x-4">
            {/* Bell */}
            <TouchableOpacity onPress={() => setNotifVisible(true)} className="relative mr-4">
              <Image
                source={require("../asset/icons/bell.png")}
                className="h-7 w-7 tint-white"
                resizeMode="contain"
              />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-600 w-4 h-4 rounded-full items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
                </View>
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
                className="flex-1 justify-start items-end pt-40 bg-transparent"
              >
                <View className="bg-white rounded-md shadow-lg p-2 w-40 mt-2">
                  <TouchableOpacity onPress={handleViewInfo} className="py-2">
                    <Text className="text-black">Xem thông tin</Text>
                  </TouchableOpacity>
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
                </View>
              </Pressable>
            </Modal>

            <Modal
              transparent
              animationType="fade"
              visible={notifVisible}
              onRequestClose={() => setNotifVisible(false)}
            >
              <Pressable
                onPress={() => setNotifVisible(false)}
                className="flex-1 justify-start items-end pt-40 bg-transparent"
              >
                <View className="bg-white rounded-md shadow-lg p-2 w-72 mr-2 mt-2">
                <Text className="text-black font-semibold px-2 pb-2">Thông báo</Text>

                  {status.length === 0 ? (
                    <Text className="text-gray-500 px-2 py-2">Không có tình trạng mới</Text>
                  ) : (
                    status.map((s, idx) => (
                      <TouchableOpacity
                        key={idx}
                        className="py-2 px-2 border-b border-gray-200"
                        onPress={() => openStatus(s)}
                      >
                        <Text className="text-black font-medium">{s.name} • {s.time}</Text>
                        <Text className={`text-xs font-semibold ${reliabilityClass(s.reliability)}`}>
                          {s.reliability}
                        </Text>
                        {s.text ? (
                          <Text numberOfLines={1} className="text-gray-500 text-xs mt-1">
                            {s.text}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </Pressable>
            </Modal>
          </View>
        </View>)}
    </View>
  );
}
