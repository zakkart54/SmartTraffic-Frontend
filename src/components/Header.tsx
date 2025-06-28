import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";

interface Props {
  userName?: string;
}

export default function Header({ userName  }: Props) {
  userName = userName || "User";
  return (
    <View className="flex-row items-center justify-between bg-[#063970] px-4 py-5">
      <Text className="text-white text-base font-semibold">Xin chào, {userName}</Text>
      <TouchableOpacity onPress={() => router.replace("/login")} className="flex-row items-center">
        <Image
          source={require("../asset/icons/logout.png")}
          className="h-5 w-5 mr-1 tint-white"
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}
