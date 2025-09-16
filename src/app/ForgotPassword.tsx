import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import TextInputField from "../components/TextInputField";
import PrimaryButton from "../components/PrimaryButton";
import AppLogo from "../components/AppLogo";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

export default function PasswordForgotPage() {
  const [email, setEmail] = useState("");

  const { theme } = useTheme();

  return (
    <View className={`flex-1 p-8 ${theme === "dark" ? "bg-[#05416C]" : "bg-[#b6d2fe]"}`}>
      <View className="mt-16">
        <AppLogo/>
      </View>
      <View className="flex-1 justify-evenly">
        <View className="relative items-center mb-6 h-10 justify-center">
            <TouchableOpacity onPress={() => router.replace("/Login")} className="absolute left-0">
            <Image
                source={require("../asset/icons/back.png")}
                className="h-6 w-6 tint-white"
                resizeMode="contain"
            />
            </TouchableOpacity>
            <Text className={`text-3xl font-bold text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>Quên mật khẩu</Text>
        </View>
        
        <TextInputField
        label="Email"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        />

        <PrimaryButton title="Nhận OTP" onPress={() => router.replace("/ForgotPasswordOtp")} />
      </View>
    </View>
  );
}
