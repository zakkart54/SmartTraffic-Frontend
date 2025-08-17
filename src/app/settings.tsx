import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, Switch } from "react-native";
import AppLogo from "../components/AppLogo";
import TextInputField from "../components/TextInputField";
import PrimaryButton from "../components/PrimaryButton";
import { router } from "expo-router";
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from "@/hooks/useTheme";

const trafficData = {
  email: 'nguyenvana123@gmail.com',
  username: 'nguyenvana',
  password:'123456',
};

export default function SettingsPage() {
  // const { accessToken, refresh, logout } = useAuth();
  // const hasCheckedToken = useRef(false);

  // useFocusEffect(
  //   useCallback(() => {
  //     const checkToken = async () => {
  //       if (hasCheckedToken.current) return; 
  //       hasCheckedToken.current = true;

  //       try {
  //         if (accessToken) {
  //           await refresh();
  //         } else {
  //           router.push('/Login');
  //         }
  //       } catch (e) {
  //         await logout();
  //         router.push('/Login');
  //       }
  //     };

  //     checkToken();
  //   }, [])
  // );
  const [email, setEmail] = useState(trafficData.email);
  const [username, setUsername] = useState(trafficData.username);
  const { theme, setTheme } = useTheme();

  const handleUpdate = () => {
    Alert.alert("Cập nhật thành công", `Email: ${email}\nUsername: ${username}`);
  };

  return (
    // <View className="flex-1 bg-[#05416C]">
    <View className={`flex-1 ${theme === "dark" ? "bg-[#05416C]" : "bg-[#b6d2fe]"}`}>
      <ScrollView className="flex-1 p-8" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mt-16">
          <AppLogo />
        </View>

        {/* Header */}
        <View className="relative items-center mt-12 mb-9 h-10 justify-center">
          <TouchableOpacity onPress={() => router.back()} className="absolute left-0">
            <Image
              source={require("../asset/icons/back.png")}
              className="h-6 w-6 tint-white"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text
            className={`text-3xl font-bold text-center ${
              theme === "dark" ? "text-white" : "text-blue-900"
            }`}
          >
            Cài đặt
          </Text>
        </View>

        
        <TextInputField
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInputField
          label="Tên tài khoản"
          placeholder="Nhập tên tài khoản"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInputField
          label="Mật khẩu"
          value={trafficData.password}
          secureTextEntry
          editable={false}
        />

        <View className="flex-row px-2 mb-2 mt-4">
          <Text className={`mr-16 ${theme === "dark" ? "text-white" : "text-black"} font-bold`}>
            Giao diện
          </Text>
          <TouchableOpacity
            onPress={() => setTheme("light")}
            className={`w-6 h-6 rounded-full mr-2 border-2 ${
              theme === "light" ? "bg-blue-300 border-blue-400" : "border-gray-400"
            }`}
          />
          <Text className={`mr-16 ${theme === "dark" ? "text-white" : "text-black"}`}>Sáng</Text>
          <TouchableOpacity
            onPress={() => setTheme("dark")}
            className={`w-6 h-6 rounded-full mr-2 border-2 ${
              theme === "dark" ? "bg-blue-800 border-blue-600" : "border-gray-400"
            }`}
          />
          <Text className={`${theme === "dark" ? "text-white" : "text-black"}`}>Tối</Text>
        </View>

        <View className="flex-row justify-between mt-16">
            <View className="flex-1 mr-2">
                <PrimaryButton title="Cập nhật" onPress={handleUpdate} />
            </View>
            <View className="flex-1 ml-2">
                <PrimaryButton
                title="Đổi mật khẩu"
                onPress={() => router.push("/ForgotPassword")}
                />
            </View>
        </View>
      </ScrollView>
    </View>
  );
}
