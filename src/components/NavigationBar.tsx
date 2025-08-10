import React from "react";
import { View, TouchableOpacity, Text, Image } from "react-native";
import { router, usePathname } from "expo-router";

const tabs = [
  { label: "Trang chủ", path: "/", icon: require("@/asset/icons/home.png") },
  { label: "Bản đồ", path: "/Map", icon: require("@/asset/icons/map.png") },
  { label: "Gửi tình trạng", path: "/Report", icon: require("@/asset/icons/report.png") },
  { label: "Gợi ý", path: "/Suggest", icon: require("@/asset/icons/suggest.png") },
];

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <View className="flex-row justify-around bg-[#063970] py-2 border-t border-blue-800">
      {tabs.map(({ label, path, icon }) => {
        const active = pathname === path;
        return (
          <TouchableOpacity
            key={path}
            className="flex-1 items-center"
            onPress={() => router.replace(path)}
          >
            <Image
              source={icon}
              className={` ${active ? "tint-white" : "tint-blue-800"}`}
              resizeMode="contain"
              style={{ width: "50%", height: undefined, aspectRatio: 1 }}
            />
            <Text className={`text-sm font-medium ${active ? "text-white" : "text-blue-300"}`}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}