import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import AppLogo from "../components/AppLogo";
import TextInputField from "../components/TextInputField";
import PrimaryButton from "../components/PrimaryButton";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/hooks/useUser";

export default function ChangePassword() {
  const { theme } = useTheme();
  const { changePassword } = useUser();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới và xác nhận không khớp");
      return;
    }

    try {
      setIsLoading(true);
      await changePassword(oldPassword, newPassword );
      Alert.alert("Thành công", "Đổi mật khẩu thành công");
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className={`flex-1 ${theme === "dark" ? "bg-[#05416C]" : "bg-[#b6d2fe]"}`}>
      <ScrollView className="flex-1 p-8" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mt-16">
          <AppLogo />
        </View>

        <View className="relative items-center mt-12 mb-9 h-10 justify-center">
          <TouchableOpacity onPress={() => router.back()} className="absolute left-0">
            <Image source={require("../asset/icons/back.png")} className="h-6 w-6 tint-white" />
          </TouchableOpacity>
          <Text
            className={`text-3xl font-bold text-center ${
              theme === "dark" ? "text-white" : "text-blue-900"
            }`}
          >
            Đổi mật khẩu
          </Text>
        </View>

        <TextInputField
          label="Mật khẩu cũ"
          placeholder="Nhập mật khẩu cũ"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
        />
        <TextInputField
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TextInputField
          label="Xác nhận mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View className="mt-8">
          <PrimaryButton
            title={isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
            onPress={handleChangePassword}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
}
