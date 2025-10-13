import { View, Text, ImageBackground, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator} from 'react-native';
import NavigationBar from '@/components/NavigationBar';
import { useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import { useTheme } from '@/hooks/useTheme';
import { router } from "expo-router";
import { useState, useEffect } from 'react';
import { useReport } from "@/hooks/useReport";
import { useSegment } from "@/hooks/useSegment";
import { useData } from '@/hooks/useData';

export default function DetailStatus() {
  const { report } = useLocalSearchParams();
  const reportData = report ? JSON.parse(report as string) : null;
  const { theme } = useTheme();
  
  const { getDataDetail } = useData();
  
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getStatusName = (statusInfo: any) => {
    if (!statusInfo) return 'Không xác định';
    const statuses = [];
    if (statusInfo.TrafficJamFlag) statuses.push('Kẹt xe');
    if (statusInfo.FloodedFlag) statuses.push('Ngập nước');
    if (statusInfo.ObstaclesFlag) statuses.push('Chướng ngại vật');
    if (statusInfo.PoliceFlag) statuses.push('Có công an');
    return statuses.length > 0 ? statuses.join(' • ') : '✅ Thông thoáng';
  };
  
  useEffect(() => {
    async function fetchDetailData() {
      if (!reportData) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const promises: Promise<any>[] = [];

        const textFlag = !!reportData.dataTextID;
        const imgFlag = !!reportData.dataImgID;
        
        if (imgFlag) {
          promises.push(getDataDetail(reportData.dataImgID));
        }
        
        if (textFlag) {
          promises.push(getDataDetail(reportData.dataTextID));
        }
        
        const results = await Promise.all(promises);

        let imageData = null;
        let textData = null;
        
        if (imgFlag && textFlag) {
          [imageData, textData] = results;
        } else if (imgFlag) {
          [imageData] = results;
        } else if (textFlag) {
          [textData] = results;
        }
        
        const statusName = getStatusName(imageData?.status?.statuses || textData?.status?.statuses);
        const mappedData = {
          time: new Date(reportData.createdDate).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          name: statusName,
          reliability: `${Math.round((reportData.eval || 0) * 100)}%`,
          image: imageData?.content?.type === "image"
            ? { uri: `data:image/jpeg;base64,${imageData.content.content}` }
            : null,
          text:
            textData?.content?.type === "text"
              ? textData.content.content
              : '',
          location: {
            latitude: Math.abs(reportData.lat || 0).toFixed(6),
            longitude: Math.abs(reportData.lon || 0).toFixed(6),
            latitudeDir: reportData.lat >= 0 ? "Bắc" : "Nam",
            longitudeDir: reportData.lon >= 0 ? "Đông" : "Tây",
            street: reportData.segmentName || 'Không xác định',
          }
        };
        
        setStatusData(mappedData);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết tình trạng:', error);
        setStatusData({
          time: new Date(reportData.createdDate).toLocaleString('vi-VN'),
          name: 'Không xác định',
          reliability: `${reportData.eval}%`,
          image: null,
          text: '',
          location: {
            latitude: Math.abs(reportData.lat).toFixed(6),
            longitude: Math.abs(reportData.lon).toFixed(6),
            latitudeDir: reportData.lat >= 0 ? "Bắc" : "Nam",
            longitudeDir: reportData.lon >= 0 ? "Đông" : "Tây",
            street: 'Không xác định',
          }
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDetailData();
  }, [report]);

  if (!reportData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-black">Không có dữ liệu tình trạng</Text>
      </View>
    );
  }

  if (loading) {
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
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme === "dark" ? "#fff" : "#063970"} />
          <Text className={`mt-4 text-xl ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>
            Đang tải thông tin...
          </Text>
        </View>
        <NavigationBar />
      </ImageBackground>
    );
  }

  if (!statusData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-black">Không thể tải dữ liệu</Text>
      </View>
    );
  }

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
          <View className="mt-4">
            <View className="flex-row items-center justify-center relative">
              <TouchableOpacity onPress={() => router.back()} className="absolute left-0">
                <Image
                  source={require("../asset/icons/back.png")}
                  className="h-6 w-6 tint-white"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text className={`text-4xl font-bold text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>Tình trạng</Text>
            </View>
            <View className="bg-[#edf2fc] p-4 rounded-xl mt-4 items-center">
              <Text className="text-[#063970] text-3xl font-bold">{statusData.time}</Text>
              <Text className="text-[#063970] text-3xl mt-1">{statusData.name}</Text>
            </View>
          </View>
          <View className="mt-4">
            <View className="bg-[#edf2fc] p-4 rounded-xl mt-2 items-center">
              <Text className="text-[#063970] text-3xl font-bold text-center">Độ tin cậy</Text>
              <Text
                className={`text-5xl font-bold mt-2 ${
                  parseInt(statusData.reliability) >= 80
                    ? 'text-green-600'
                    : parseInt(statusData.reliability) >= 50
                    ? 'text-yellow-500'
                    : 'text-red-600'
                }`}
              >
                {statusData.reliability}
              </Text>
            </View>
          </View>

          {(statusData.image || statusData.text) && (
            <View className="mt-8">
              <Text className={`text-4xl font-bold text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>Mô tả tình trạng</Text>
              
              {statusData.image && statusData.text && statusData.text.trim() !== "" ? (
                <View>
                  <View className="bg-[#edf2fc] p-4 rounded-xl mt-2 items-center">
                    <Image
                      source={statusData.image}
                      className="w-72 h-72 rounded-lg"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="bg-[#edf2fc] p-2 rounded-xl mt-2">
                    <TextInput
                      value={statusData.text}
                      editable={false}
                      multiline
                      className="text-black text-xl p-2"
                    />
                  </View>
                </View>
              ) : statusData.image && (!statusData.text || statusData.text.trim() === "") ? (
                <View className="bg-[#edf2fc] p-4 rounded-xl mt-2 items-center">
                  <Image
                    source={statusData.image}
                    className="w-72 h-72 rounded-lg"
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View className="bg-[#edf2fc] p-2 rounded-xl mt-2">
                  <TextInput
                    value={statusData.text}
                    editable={false}
                    multiline
                    className="text-black text-xl p-2"
                  />
                </View>
              )}
            </View>
          )}

          <View className="mt-8">
            <Text className={`text-4xl font-bold text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>Vị trí phát hiện</Text>
            <View className="bg-[#edf2fc] p-8 rounded-2xl mt-4">
              <View className="flex-row justify-between">
                <View className="items-center mt-2">
                  <Text className="text-[#063970] text-xl">Vĩ độ</Text>
                  <Text className="text-[#063970] text-3xl font-bold">{statusData.location.latitude}</Text>
                  <Text className="text-[#063970] text-xl">{statusData.location.latitudeDir}</Text>
                </View>

                <View className="items-center mt-2">
                  <Text className="text-[#063970] text-xl">Kinh độ</Text>
                  <Text className="text-[#063970] text-3xl font-bold">{statusData.location.longitude}</Text>
                  <Text className="text-[#063970] text-xl">{statusData.location.longitudeDir}</Text>
                </View>
              </View>
              <View className="items-center mt-2">
                <Text className="text-[#063970] text-2xl font-bold">{statusData.location.street}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <NavigationBar />
    </ImageBackground>
  );
}