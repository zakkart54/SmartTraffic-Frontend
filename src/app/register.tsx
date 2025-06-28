import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import TextInputField from "../components/TextInputField";
import PrimaryButton from "../components/PrimaryButton";
import AppLogo from "../components/AppLogo";
import { router } from "expo-router";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <View className="flex-1 bg-[#05416C] p-8">
      <View className="mt-16">
        <AppLogo/>
      </View>
      <View className="flex-1 justify-evenly">
        <View className="relative items-center mb-6 h-10 justify-center">
            <TouchableOpacity onPress={() => router.replace("/login")} className="absolute left-0">
            <Image
                source={require("../asset/icons/back.png")}
                className="h-6 w-6 tint-white"
                resizeMode="contain"
            />
            </TouchableOpacity>
            <Text className="text-3xl text-white font-bold text-center">Đăng ký</Text>
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

        <TextInputField
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
        />

        <PrimaryButton title="Tạo tài khoản" onPress={() => router.replace("/login")}/>

        <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text className="text-white text-center mt-4">Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}