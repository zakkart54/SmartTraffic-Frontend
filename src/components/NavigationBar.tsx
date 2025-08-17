import React from "react";
import { View, TouchableOpacity, Text, Image } from "react-native";
import { router, usePathname } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

// const tabs = [
//   { label: "Trang chủ", path: "/", icon: require("@/asset/icons/home.png") },
//   { label: "Bản đồ", path: "/map", icon: require("@/asset/icons/map.png") },
//   { label: "Gửi tình trạng", path: "/report", icon: require("@/asset/icons/report.png") },
//   { label: "Gợi ý", path: "/suggest", icon: require("@/asset/icons/suggest.png") },
// ];

export default function NavigationBar() {
  const pathname = usePathname();

  const { theme } = useTheme();

  const tabs = [
    { 
      label: "Trang chủ", 
      path: "/", 
      icon: theme === "dark" 
        ? require("@/asset/icons/home.png") 
        : require("@/asset/icons/home1.png") 
    },
    { 
      label: "Bản đồ", 
      path: "/map", 
      icon: theme === "dark" 
        ? require("@/asset/icons/map.png") 
        : require("@/asset/icons/map1.png") 
    },
    { 
      label: "Gửi tình trạng", 
      path: "/report", 
      icon: theme === "dark" 
        ? require("@/asset/icons/report.png") 
        : require("@/asset/icons/report1.png") 
    },
    { 
      label: "Gợi ý", 
      path: "/suggest", 
      icon: theme === "dark" 
        ? require("@/asset/icons/suggest.png") 
        : require("@/asset/icons/suggest1.png") 
    },
  ];

  const activeBg = theme === "dark" ? "bg-blue-800" : "bg-blue-400";
  const inactiveBg = "bg-transparent";
  const activeText = theme === "dark" ? "text-white" : "text-black";
  const inactiveText = theme === "dark" ? "text-blue-300" : "text-gray-700";
  const activeTint = theme === "dark" ? "tint-white" : "tint-black";
  const inactiveTint = theme === "dark" ? "tint-blue-300" : "tint-gray-700";

  return (
    <View
      className={`flex-row justify-around ${
        theme === "dark" ? "bg-[#063970]" : "bg-[#b6d2fe]"
      } py-2 border-t ${theme === "dark" ? "border-blue-800" : "border-gray-400"}`}
    >
      {tabs.map(({ label, path, icon }) => {
        const active = pathname === path;
        return (
          <TouchableOpacity
            key={path}
            className={`flex-1 items-center py-2 ${
              active ? activeBg : inactiveBg
            }`}
            onPress={() => router.replace(path)}
          >
            <Image
              source={icon}
              className={active ? activeTint : inactiveTint}
              resizeMode="contain"
              style={{ width: "50%", height: undefined, aspectRatio: 1 }}
            />
            <Text
              className={`text-sm font-bold ${
                active ? activeText : inactiveText
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}