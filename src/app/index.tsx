import React, { useCallback, useRef } from 'react';
import { View, Text, ImageBackground } from 'react-native';
import NavigationBar from '@/components/NavigationBar';
import { router } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

const trafficData = {
  location: {
    longitude: '10.8263°',
    latitude: '106.7047°',
    longitudeDir: 'Bắc',
    latitudeDir: 'Đông',
    street: 'Đường Đặng Thùy Trâm',
  },
  status: 'Kẹt xe',
};

export default function HomePage() {
  const { accessToken, refresh, logout } = useAuth();
  const hasCheckedToken = useRef(false); 

  useFocusEffect(
    useCallback(() => {
      const checkToken = async () => {
        if (hasCheckedToken.current) return; 
        hasCheckedToken.current = true;

        try {
          if (accessToken) {
            await refresh();
          } else {
            router.push('/Login');
          }
        } catch (e) {
          await logout();
          router.push('/Login');
        }
      };

      checkToken();
    }, [])
  );

  return (
    <ImageBackground
      source={require('@/asset/background.png')}
      resizeMode="cover"
      style={{ flex: 1, width: "100%", height: "100%" }}
    >
      <Header />
      <View className="flex-1 px-4 pt-4 justify-evenly">
        <View className="mt-4">
          <Text className="text-white text-2xl font-bold text-center">Vị trí hiện tại</Text>

          <View className="bg-[#edf2fc] p-8 rounded-2xl mt-4">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-black text-sm">Kinh độ</Text>
                <Text className="text-black text-2xl font-bold">{trafficData.location.longitude}</Text>
                <Text className="text-black text-lg">{trafficData.location.longitudeDir}</Text>
              </View>

              <View>
                <Text className="text-black text-sm">Vĩ độ</Text>
                <Text className="text-black text-2xl font-bold">{trafficData.location.latitude}</Text>
                <Text className="text-black text-lg">{trafficData.location.latitudeDir}</Text>
              </View>
            </View>
            <Text className="text-black text-base mt-2">{trafficData.location.street}</Text>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-white text-2xl font-bold text-center">Tình trạng giao thông</Text>
          <View className="bg-[#edf2fc] mb-2 p-8 rounded-xl mt-4">
            <Text className="text-black text-xl font-bold">{trafficData.status}</Text>
          </View>
        </View>
      </View>
      <NavigationBar />
    </ImageBackground>
  );
}
