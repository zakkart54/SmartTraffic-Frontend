import React from "react";
import { View, Text, Image } from "react-native";

export default function AppLogo() {
  return (
    <View className="h-16 flex-row items-center justify-center">
      <Image
        source={require("../asset/logo1.png")}
        resizeMode="contain"
        style={{ width: "30%", height: undefined, marginRight: -15, aspectRatio: 1 }}
      />
      <Text className="text-white font-bold text-3xl">SmartTraffic</Text>
    </View>
  );
}