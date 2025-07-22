import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal, Pressable } from "react-native";
import { router } from "expo-router";

interface Props {
  userName?: string;
}

export default function Header({ userName }: Props) {
  userName = userName || "User";
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = () => {
    setMenuVisible(false);
    router.replace("/Login");
  };

  const handleViewInfo = () => {
    setMenuVisible(false);
    router.push("/SubmittedReportView");
  };

  const handleSettings = () => {
    setMenuVisible(false);
    router.push("/Settings");
  };

  return (
    <View className="flex-row items-center justify-between bg-[#063970] px-4 py-5">
      <Text className="text-white text-base font-semibold">Xin chào, {userName}</Text>
      
      <TouchableOpacity onPress={() => setMenuVisible(true)} className="flex-row items-center">
        <Image
          source={require("../asset/icons/menu.png")}
          className="h-5 w-5 tint-white"
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
          className="flex-1 justify-start items-end pt-10  bg-transparent"
        >
          <View className="bg-white rounded-md shadow-lg p-2 w-40">
            <TouchableOpacity onPress={handleViewInfo} className="py-2">
              <Text className="text-black">Xem thông tin</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSettings} className="py-2">
              <Text className="text-black">Cài đặt</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} className="py-2">
              <Text className="text-red-600">Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
