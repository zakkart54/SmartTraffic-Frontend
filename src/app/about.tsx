import React, { useRef, useState } from "react";
import { View, Text, ScrollView, Dimensions, ImageBackground, TouchableOpacity } from "react-native";
import AppLogo from "../components/AppLogo";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

const { width } = Dimensions.get("window");
const pages = [
  { title: "XỬ LÝ DỮ LIỆU", description: "Xử lý dữ liệu về tình trạng giao thông bằng những mô hình học máy, có thể kiểm chứng được tính tin cậy của dữ liệu." },
  { title: "THU THẬP THÔNG TIN", description: "Thu thập thông tin về tình trạng giao thông thời gian thực." },
  { title: "THÔNG BÁO TÌNH TRẠNG", description: "Xử lý dữ liệu về tình trạng giao thông bằng những mô hình học máy, có thể kiểm chứng được tính tin cậy của dữ liệu." },
  { title: "BẮT ĐẦU NGAY", description: "Đăng nhập hoặc đăng ký để trải nghiệm tất cả tính năng của chúng tôi." }
];

export default function AboutPage() {
  const scrollRef = useRef<ScrollView>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const handleScroll = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setPageIndex(newIndex);
  };

  const { theme } = useTheme();

  return (
    <View className={`flex-1 p-8 ${theme === "dark" ? "bg-[#063970]" : "bg-[#b6d2fe]"}`}>
      <ImageBackground
        source={
          theme === "dark"
            ? require("@/asset/background.png")
            : require("@/asset/background1.png")
        }
        resizeMode="cover"
        style={{ flex: 1, width: "100%", height: "100%" }}
    >
        <TouchableOpacity
            onPress={() => router.replace("/login")}
            className="absolute right-10 top-10 z-10"
        >
            <Text className="text-white text-lg underline">Skip</Text>
        </TouchableOpacity>
        <View className="mt-16 mr-10">
            <AppLogo />
        </View>

        <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ref={scrollRef}
            className="mt-6"
            contentContainerStyle={{ alignItems: "center" }}
        >
            {pages.map((page, index) => (
            <View
                key={index}
                style={{ width }}
                className="items-center justify-center px-8"
            >
                <View className="mb-6">
                <Text className={`text-4xl font-bold mb-4 text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>
                    {page.title}
                </Text>
                <Text className={`text-xl text-center leading-relaxed ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>
                    {page.description}
                </Text>
                </View>

                {page.title === "BẮT ĐẦU NGAY" && (
                  <TouchableOpacity
                    onPress={() => router.replace("/register")}
                    className="mt-4 bg-white px-6 py-3 rounded-full"
                  >
                    <Text className="text-[#063970] text-lg font-bold">Đăng ký</Text>
                  </TouchableOpacity>
                )}
            </View>
            ))}
        </ScrollView>

        <View className="flex-row justify-center mt-6 mb-2">
            {pages.map((_, index) => (
            <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${index === pageIndex ? "bg-white" : "bg-blue-300"}`}
            />
            ))}
        </View>
      </ImageBackground>
    </View>
  );
}