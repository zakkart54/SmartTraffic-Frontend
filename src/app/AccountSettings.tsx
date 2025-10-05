import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { z } from "zod";
import AppLogo from "../components/AppLogo";
import TextInputField from "../components/TextInputField";
import PrimaryButton from "../components/PrimaryButton";
import DateTimeInputField from "@/components/DateTimeInputField";
import { useTheme } from "@/hooks/useTheme";
import { useUser, UserProfile } from "@/hooks/useUser";

export default function AccountSettings() {
  const { theme } = useTheme();
  const { getUserProfile, updateUserProfile, isLoading } = useUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [DoB, setDoB] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{ fullName?: string; DoB?: string; phoneNum?: string }>({});

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        setEmail(data.email ?? "");
        setUsername(data.username ?? "");
        setFullName(data.fullName ?? "");
        setDoB(data.DoB ? formatDate(data.DoB) : "");
        setPhoneNum(data.phoneNum ?? "");
      } catch (err) {
        console.error("Lỗi lấy profile:", err);
      }
    })();
  }, []);

  const handleUpdate = async () => {
    setErrors({});

    const schema = z.object({
      fullName: z.string().min(1, "Họ tên không được để trống"),
      DoB: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Ngày sinh không đúng định dạng DD/MM/YYYY")
        .refine((val) => {
          const [d, m, y] = val.split("/").map(Number);
          const date = new Date(y, m - 1, d);
          return (
            date.getFullYear() === y &&
            date.getMonth() === m - 1 &&
            date.getDate() === d
          );
        }, "Ngày sinh không hợp lệ"),
      phoneNum: z
        .string()
        .regex(/^\d{9,11}$/, "Số điện thoại không hợp lệ (9-11 chữ số)"),
    });

    const result = schema.safeParse({ fullName, DoB, phoneNum });

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Dữ liệu không hợp lệ";
      Alert.alert("Lỗi", firstError);
      return;
    }

    setIsSubmitting(true);
    const [d, m, y] = DoB.split("/");
    const formattedDoB = `${y}/${m}/${d}`;

    try {
      await updateUserProfile({ fullName, DoB: formattedDoB, phoneNum });
      setEditing(false);
      Alert.alert("Thành công", "Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Cập nhật thất bại:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.fullName ?? "");
      setDoB(profile.DoB? formatDate(profile.DoB) : "");
      setPhoneNum(profile.phoneNum ?? "");
    }
    setErrors({});
    setEditing(false);
  };

  if (isLoading && !profile) {
    return (
      <View className={`flex-1 ${theme === "dark" ? "bg-[#05416C]" : "bg-[#b6d2fe]"}`}>
        <TouchableOpacity onPress={() => router.back()} className="absolute left-0">
          <Image source={require("../asset/icons/back.png")} className="h-6 w-6 tint-white" />
        </TouchableOpacity>
        <ScrollView className="flex-1 p-8" contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="mt-16">
            <AppLogo />
          </View>
          <View className="flex-1 justify-center items-center">
            <Text className={`${theme === "dark" ? "text-white" : "text-black"}`}>Đang tải...</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${theme === "dark" ? "bg-[#05416C]" : "bg-[#b6d2fe]"}`}>
      <ScrollView className="flex-1 p-8" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="items-center mt-16">
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
            Tài khoản
          </Text>
        </View>
  
        <View className={`rounded-xl p-4 mb-6 shadow ${theme === "dark" ? "bg-[#1488DB]" : "bg-white"}`}>
          <TextInputField label="Email" value={email} rightIconName="lock" editable={false} />
          <TextInputField label="Tên tài khoản" value={username} rightIconName="lock" editable={false} />
  
          <View className="mb-3">
            <TextInputField
              label="Họ tên"
              placeholder="Nhập họ tên"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
              editable={editing}
            />
            {errors.fullName && <Text className="text-red-500 mt-1">{errors.fullName}</Text>}
          </View>
  
          <View className="mb-3">
            <DateTimeInputField
              onChangeText={setDoB}
              label="Ngày sinh"
              format="DD/MM/YYYY"
              value={DoB}
              editable={editing}
            />
            {errors.DoB && <Text className="text-red-500 mt-1">{errors.DoB}</Text>}
          </View>
  
          <View className="mb-3">
            <TextInputField
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              value={phoneNum}
              onChangeText={setPhoneNum}
              editable={editing}
            />
            {errors.phoneNum && <Text className="text-red-500 mt-1">{errors.phoneNum}</Text>}
          </View>
        </View>
  
        {!editing ? (
          <View className="mt-8">
            <PrimaryButton title="Chỉnh sửa" onPress={() => setEditing(true)} />
          </View>
        ) : (
          <View className="flex-row justify-between mt-8">
            <View className="flex-1 mr-2">
              <PrimaryButton title="Hủy" onPress={handleCancel} />
            </View>
            <View className="flex-1 ml-2">
              <PrimaryButton
                title={isSubmitting ? "Đang lưu..." : "Cập nhật"}
                onPress={handleUpdate}
                disabled={isSubmitting}
              />
            </View>
          </View>
        )}
  
        <View className="mt-4">
          <PrimaryButton title="Đổi mật khẩu" onPress={() => router.push("/ChangePassword")} />
        </View>
      </ScrollView>
    </View>
  );  
}
