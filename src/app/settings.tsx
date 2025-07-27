import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import AppLogo from "../components/AppLogo";
import TextInputField from "../components/TextInputField";
import PrimaryButton from "../components/PrimaryButton";
import { router } from "expo-router";
import { useAuth } from '@/hooks/useAuth';

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

  const handleUpdate = () => {
    Alert.alert("Cập nhật thành công", `Email: ${email}\nUsername: ${username}`);
  };

  return (
    <View className="flex-1 bg-[#05416C]">
      <ScrollView className="flex-1 p-8" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mt-16">
          <AppLogo />
        </View>

        {/* Header */}
        <View className="relative items-center mb-6 h-10 justify-center">
          <TouchableOpacity onPress={() => router.back()} className="absolute left-0">
            <Image
              source={require("../asset/icons/back.png")}
              className="h-6 w-6 tint-white"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-3xl text-white font-bold text-center">Cài đặt</Text>
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

        <View className="flex-row justify-between mt-4">
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
