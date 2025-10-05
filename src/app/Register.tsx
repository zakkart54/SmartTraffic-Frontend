import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from "react-native";
import TextInputField from "../components/TextInputField";
import PrimaryButton from "../components/PrimaryButton";
import AppLogo from "../components/AppLogo";
import { router } from "expo-router";
import { useUser } from "../hooks/useUser";
import { useTheme } from "@/hooks/useTheme";
// import { format } from "date-fns";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { addUser, isLoading } = useUser();

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ.");
      return;
    }
  
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const user = 
        { 
          "fullName": username,
          "username": username,
          "password" : password ,
          "admin": false,
          "email": email,
          // "DoB": format(new Date(), "yyyy/MM/dd")
          // "DoB": "2025/07/12"
        }
      await addUser(user);
      Alert.alert("Thành công", "Tạo tài khoản thành công!");
      router.replace("/Login");
    } catch (e) {
      if (!e.message) {
        Alert.alert("Đăng ký thất bại", "Tài khoản hoặc email đã tồn tại.");
        return;
      }
      else Alert.alert("Đăng ký thất bại", e.message);
    }
  };

  const { theme } = useTheme();

  return (
    <View className={`flex-1 ${theme === "dark" ? "bg-[#05416C]" : "bg-[#b6d2fe]"}`}>
      <ScrollView className="flex-1 p-8" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mt-16">
          <AppLogo />
        </View>

        <View className="relative items-center mt-12 mb-6 h-10 justify-center">
          <TouchableOpacity onPress={() => router.replace("/Login")} className="absolute left-0">
            <Image
              source={require("../asset/icons/back.png")}
              className="h-6 w-6 tint-white"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className={`text-3xl font-bold text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>Đăng ký</Text>
        </View>

        <View className="mt-8">
          <TextInputField
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="mt-8">
          <TextInputField
            label="Tên tài khoản"
            placeholder="Nhập tên tài khoản"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View className="mt-8">
          <TextInputField
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View className="mt-8">
          <TextInputField
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        <View className="mt-8">
          <PrimaryButton title="Tạo tài khoản" onPress={handleRegister} disabled={isLoading} />
        </View>
        <View className="mt-4">
        <TouchableOpacity onPress={() => router.replace("/Login")}>
          <Text className={`text-center mt-4 ${theme === "dark" ? "text-white" : "text-black"}`}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
