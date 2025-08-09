import React, { useCallback, useRef } from 'react';
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
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
  status: [
    {
      name: 'Kẹt xe',
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
      name: 'Tai nạn',
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
  ],
};

export default function HomePage() {
  const { accessToken, refresh, logout } = useAuth();
  const hasCheckedToken = useRef(false); 

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

  return (
    <ImageBackground
      source={require('@/asset/background.png')}
      resizeMode="cover"
      style={{ flex: 1, width: "100%", height: "100%" }}
    >
      <Header />
      <View className="flex-1 px-4 pt-4 justify-evenly">
        <View className="mt-4">
          <Text className="text-white text-4xl font-bold text-center">Vị trí hiện tại</Text>

          <View className="bg-[#edf2fc] p-8 rounded-2xl mt-4">
            <View className="flex-row justify-between">
              <View className="items-center mt-2">
                <Text className="text-black text-xl">Kinh độ</Text>
                <Text className="text-black text-3xl font-bold">{trafficData.location.longitude}</Text>
                <Text className="text-black text-xl">{trafficData.location.longitudeDir}</Text>
              </View>

              <View className="items-center mt-2">
                <Text className="text-black text-xl">Vĩ độ</Text>
                <Text className="text-black text-3xl font-bold">{trafficData.location.latitude}</Text>
                <Text className="text-black text-xl">{trafficData.location.latitudeDir}</Text>
              </View>
            </View>
            <View className="items-center mt-2">
              <Text className="text-black text-2xl font-bold">{trafficData.location.street}</Text>
            </View>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-white text-4xl font-bold text-center">
            Tình trạng giao thông
          </Text>
          {trafficData.status.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                router.push({
                  pathname: '/detailStatus',
                  params: { status: JSON.stringify(item) },
                })
              }
            >
              <View className="bg-[#edf2fc] mb-2 p-6 rounded-xl mt-4">
                <Text className="text-black text-2xl font-bold">
                  {item.name} {'-'} {item.time}
                  {/* <Text
                    className={
                      parseInt(item.reliability) >= 80
                        ? 'text-green-600'
                        : parseInt(item.reliability) >= 50
                        ? 'text-orange-500'
                        : 'text-red-500'
                    }
                  >
                    {item.reliability}
                  </Text> */}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <NavigationBar />
    </ImageBackground>
  );
}
