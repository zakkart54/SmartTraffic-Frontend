import React, { useCallback, useRef } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, Button } from 'react-native';
import NavigationBar from '@/components/NavigationBar';
import { router } from "expo-router";
import Header from '@/components/Header';
// import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const trafficData = {
  location: {
    longitude: '10.8263°',
    latitude: '106.7047°',
    longitudeDir: 'Bắc',
    latitudeDir: 'Đông',
    street: 'Đường Đặng Thùy Trâm',
  },
  status: [
    {
      name: 'Kẹt xe trên đường Đặng Thùy Trâm',
      time: '12:30 PM',
      reliability: '90%',
      text: 'Đường đông đúc, xe cộ di chuyển chậm và có thể xảy ra ùn tắc.',
      description: 'Đường đông đúc, xe cộ di chuyển chậm.',
      location: {
        longitude: '10.8263°',
        latitude: '106.7047°',
        longitudeDir: 'Bắc',
        latitudeDir: 'Đông',
        street: 'Đường Đặng Thùy Trâm',
      },
    },
    {
      name: 'Tai nạn trên cầu Bình Lợi',
      time: '01:15 PM',
      reliability: '40%',
      text: 'Có vụ tai nạn trên cầu Bình Lợi.',
      description: 'Tai nạn giao thông, gây ùn tắc nhẹ.',
      location: {
        longitude: '10.8300°',
        latitude: '106.7100°',
        longitudeDir: 'Bắc',
        latitudeDir: 'Đông',
        street: 'Cầu Bình Lợi',
      },
    },
  ]
};

export default function HomePage() {
  // const { accessToken, refresh, logout } = useAuth();
  // const hasCheckedToken = useRef(false);
  const { theme } = useTheme();

  return (
    <ImageBackground
      source={
        theme === "dark"
          ? require("@/asset/background.png")
          : require("@/asset/background1.png")
      }
      resizeMode="cover"
      style={{ flex: 1, width: "100%", height: "100%" }}
    >
      <Header />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-1 px-4 pt-4 justify-evenly">
          <View className="mt-20">
            <Text className={`text-4xl font-bold text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>Vị trí hiện tại</Text>

            <View className="bg-[#edf2fc] p-8 rounded-2xl mt-4">
              <View className="flex-row justify-between">
                <View className="items-center mt-2">
                  <Text className="text-[#063970] text-xl">Kinh độ</Text>
                  <Text className="text-[#063970] text-3xl font-bold">{trafficData.location.longitude}</Text>
                  <Text className="text-[#063970] text-xl">{trafficData.location.longitudeDir}</Text>
                </View>

                <View className="items-center mt-2">
                  <Text className="text-[#063970] text-xl">Vĩ độ</Text>
                  <Text className="text-[#063970] text-3xl font-bold">{trafficData.location.latitude}</Text>
                  <Text className="text-[#063970] text-xl">{trafficData.location.latitudeDir}</Text>
                </View>
              </View>
              <View className="items-center mt-2">
                <Text className="text-[#063970] text-2xl font-bold">{trafficData.location.street}</Text>
              </View>
            </View>
          </View>

          <View className="mt-20">
            <Text className={`text-4xl font-bold text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>
              Tình trạng giao thông
            </Text>
            {trafficData.status.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  router.push({
                    pathname: '/DetailStatus',
                    params: { status: JSON.stringify(item) },
                  })
                }
              >
                <View className="bg-[#edf2fc] mb-2 p-6 rounded-xl mt-4">
                  <Text className="text-[#063970] text-2xl font-bold">
                    {item.name} {'-'} {item.time}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View>
    </View>
      </ScrollView>
      <NavigationBar />
    </ImageBackground>
  );
}
