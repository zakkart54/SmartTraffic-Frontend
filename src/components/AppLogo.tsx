import React from "react";
import { View, Text, Image } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function AppLogo() {
  const { theme } = useTheme();
  return (
    <View className="h-16 flex-row items-center justify-center">
      <Image
        source={require("../asset/logo1.png")}
        resizeMode="contain"
        style={{ width: "30%", height: undefined, marginRight: -15, aspectRatio: 1 }}
      />
      <Text
        className={`font-bold text-3xl ${
          theme === "dark" ? "text-white" : "text-black"
        }`}
      >SmartTraffic</Text>
    </View>
  );
}