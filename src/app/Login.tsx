import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import TextInputField from "../components/TextInputField";
import PrimaryButton from "../components/PrimaryButton";
import AppLogo from "../components/AppLogo";
import { router } from "expo-router";
import { useAuth } from "../hooks/useAuth";

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

  return (
    <View className="flex-1 bg-[#05416C] p-8">
      <View className="mt-16">
        <AppLogo/>
      </View>

      <View className="flex-1 justify-evenly">
        <View className="relative items-center mb-6 h-10 justify-center">
          <Text className="text-3xl text-white font-bold text-center">Đăng nhập</Text>
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

        <View className="mt-4">
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

        <PrimaryButton title="Đăng nhập" disabled={isLoading} onPress={handleLogin} />
        <View>
          <TouchableOpacity onPress={() => router.push("/Register")}> 
          <Text className="text-white text-center mt-4">Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/ForgotPassword")}> 
          <Text className="text-white text-center mt-4">Quên mật khẩu?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/")}> 
          <Text className="text-white text-center mt-4">Bỏ qua</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
