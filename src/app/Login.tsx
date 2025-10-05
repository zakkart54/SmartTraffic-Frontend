import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import TextInputField from "../components/TextInputField";
import PrimaryButton from "../components/PrimaryButton";
import AppLogo from "../components/AppLogo";
import { router } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    let hasError = false;
  
    if (!username.trim()) {
      setUsernameError("Email không được để trống");
      hasError = true;
    } else {
      setUsernameError("");
    }
  
    if (!password.trim()) {
      setPasswordError("Mật khẩu không được để trống");
      hasError = true;
    } else {
      setPasswordError("");
    }
  
    if (hasError) return;
  
    try {
      const res = await login(username, password);
      if (res) router.replace("/");
    } catch (err: any) {
      alert(`Lỗi đăng nhập: ${err?.message}`);
    }
  };

  const { theme } = useTheme();

  return (
    <View className={`flex-1 ${theme === "dark" ? "bg-[#05416C]" : "bg-[#b6d2fe]"}`}>
      <ScrollView className="flex-1 p-8" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mt-16">
          <AppLogo/>
        </View>
      
        <View className="relative items-center mt-12 mb-9 h-10 justify-center">
          <Text className={`text-3xl font-bold text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>Đăng nhập</Text>
        </View>
        <View className="mt-4">
          <TextInputField
            label="Tên tài khoản"
            placeholder="Nhập tên tài khoản"
            autoCapitalize="none"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (usernameError) setUsernameError("");
            }}
          />
          {usernameError ? <Text className="text-red-500 mt-1 ml-1">{usernameError}</Text> : null}
        </View>

        <View className="mt-8">
          <TextInputField
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError("");
            }}
          />
          {passwordError ? <Text className="text-red-500 mt-1 ml-1">{passwordError}</Text> : null}
        </View>

        <View className="mt-8">
          <PrimaryButton title="Đăng nhập" disabled={false} onPress={handleLogin} />
        </View>
        <View className="mt-8">
          <TouchableOpacity onPress={() => router.push("/Register")}> 
          <Text className={`text-center mt-4 ${theme === "dark" ? "text-white" : "text-black"}`}>Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/ForgotPassword")}> 
          <Text className={`text-center mt-4 ${theme === "dark" ? "text-white" : "text-black"}`}>Quên mật khẩu?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/")}> 
          <Text className="text-white text-center mt-4">Bỏ qua</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
