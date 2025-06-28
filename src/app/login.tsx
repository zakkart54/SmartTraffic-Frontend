import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import TextInputField from "../components/TextInputField";
import PrimaryButton from "../components/PrimaryButton";
import AppLogo from "../components/AppLogo";
import { router } from "expo-router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="flex-1 bg-[#05416C] p-8">
      <View className="mt-16">
        <AppLogo/>
      </View>

      <View className="flex-1 justify-evenly">
        <View className="relative items-center mb-6 h-10 justify-center">
          {/* <TouchableOpacity onPress={() => router.back()} className="absolute left-0">
            <Image
              source={require("../asset/icons/back.png")}
              className="h-6 w-6 tint-white"
              resizeMode="contain"
            />
          </TouchableOpacity> */}
          <Text className="text-3xl text-white font-bold text-center">Đăng nhập</Text>
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
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        />

        <PrimaryButton title="Đăng nhập" onPress={() => router.replace("/")} />
        <View>
          <TouchableOpacity onPress={() => router.push("/register")}> 
          <Text className="text-white text-center mt-4">Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/forgot-password")}> 
          <Text className="text-white text-center mt-4">Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
