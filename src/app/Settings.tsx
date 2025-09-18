import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  TextInput,
  Animated,
  Easing,
} from "react-native";
import AppLogo from "../components/AppLogo";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useAppSettings } from "@/hooks/useAppSetting";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useAppSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [editing, setEditing] = useState(false);
  const [notifExpanded, setNotifExpanded] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);
  const notifAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLocalSettings(settings);
    setEditing(false);
  }, [settings]);

  const handleChange = (field: keyof typeof localSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
    setEditing(true);
  };

  const handleSave = () => {
    const fixed = {
      ...localSettings,
      notifInterval: localSettings.notifInterval && localSettings.notifInterval > 0
        ? localSettings.notifInterval
        : 1,
    };
    updateSettings(fixed);
    setEditing(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setEditing(false);
  };

  const toggleNotif = () => {
    Animated.timing(notifAnim, {
      toValue: notifExpanded ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
    setNotifExpanded(!notifExpanded);
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
            Cài đặt
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/AccountSettings")}
          className="bg-white rounded-xl p-4 mb-6 shadow"
        >
          <Text className="text-lg font-semibold text-blue-600">Quản lý tài khoản</Text>
          <Text className="text-gray-500 text-sm mt-1">
            Xem và chỉnh sửa thông tin tài khoản của bạn
          </Text>
        </TouchableOpacity>

        <View className="bg-white rounded-xl mb-6 shadow">
          <TouchableOpacity
            onPress={toggleNotif}
            className="flex-row justify-between items-center p-4 border-b border-gray-200"
          >
            <Text className="text-lg font-semibold">Cài đặt thông báo</Text>
            <MaterialIcons
              name={notifExpanded ? "arrow-drop-up" : "arrow-drop-down"}
              size={24}
              color="#000"
            />
          </TouchableOpacity>

          <Animated.View
            style={{
              height: notifAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, contentHeight || 10],
              }),
              overflow: "hidden",
            }}
          >
            <View
              onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
              className="p-4"
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ color: theme === "dark" ? "#fff" : "#000", fontSize: 16 }}>Bật thông báo</Text>
                <Switch
                  value={localSettings.notificationsEnabled}
                  onValueChange={(val) => handleChange("notificationsEnabled", val)}
                />
              </View>

              <Text className="text-gray-600 mb-2">Thời gian tối thiểu giữa các thông báo (phút)</Text>
              <TextInput
                editable={editing}
                keyboardType="numeric"
                value={String(localSettings.notifInterval ?? "")}
                onChangeText={(val) => handleChange("notifInterval", Number(val) || 0)}
                className={`border border-gray-300 rounded-lg px-3 py-2 mb-4 ${!editing ? "bg-gray-100" : ""}`}
              />
              <Text className="text-gray-600 mb-2">
                Khoảng cách di chuyển tối thiểu để nhận thông báo mới (mét)
              </Text>
              <TextInput
                editable={editing}
                keyboardType="numeric"
                value={String(localSettings.moveDistance ?? "")}
                onChangeText={(val) => handleChange("moveDistance", Number(val) || 0)}
                className={`border border-gray-300 rounded-lg px-3 py-2 ${!editing ? "bg-gray-100" : ""}`}
              />

              <View className="flex-row justify-center mt-4 space-x-3">
                {!editing ? (
                  <TouchableOpacity
                    onPress={() => setEditing(true)}
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white">Sửa</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={handleCancel}
                      className="bg-gray-300 px-4 py-2 rounded-lg"
                    >
                      <Text>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSave}
                      className="bg-blue-500 px-4 py-2 rounded-lg ml-3"
                    >
                      <Text className="text-white">Lưu</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Animated.View>
        </View>

        <View className="bg-white rounded-xl p-4 shadow">
          <Text className="text-lg font-semibold mb-3">Giao diện</Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setTheme("light")}
              className={`w-6 h-6 rounded-full mr-2 border-2 ${
                theme === "light" ? "bg-blue-300 border-blue-400" : "border-gray-400"
              }`}
            />
            <Text className="mr-6">Sáng</Text>

            <TouchableOpacity
              onPress={() => setTheme("dark")}
              className={`w-6 h-6 rounded-full mr-2 border-2 ${
                theme === "dark" ? "bg-blue-800 border-blue-600" : "border-gray-400"
              }`}
            />
            <Text>Tối</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
