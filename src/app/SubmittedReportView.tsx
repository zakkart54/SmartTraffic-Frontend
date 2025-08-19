import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import NavigationBar from '@/components/NavigationBar';
import Header from '@/components/Header';
import { useData } from '@/hooks/useData';
import { useTheme } from "@/hooks/useTheme";

const SubmittedReport = () => {
  const { getDataByUploaderId, isLoading } = useData();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDataByUploaderId();
        setData(res as any);

        // const base64Images = await Promise.all(
        //   data.map(async (img) => {
        //     if (!img.imageBlob) return { ...img, base64: null };

        //     const base64 = await blobToBase64(img.imageBlob);
        //     return { ...img, base64 };
        //   })
        // );

        // console.log('Fetched submitted images with base64:', base64Images);
        // setImages(base64Images);
      } catch (error) {
        console.error('Error fetching submitted images:', error);
      }
    };

    fetchData();
  }, []);

  // const blobToBase64 = (blob) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       resolve(reader.result); // base64 URI
  //     };
  //     reader.onerror = reject;
  //     reader.readAsDataURL(blob);
  //   });
  // };

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

      <ScrollView className="flex-1 px-4 pt-4">
        <Text className={`text-2xl font-bold text-center mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>Thông tin đã gửi</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : data.length === 0 ? (
          <Text className={`text-center ${theme === "dark" ? "text-white" : "text-black"}`}>Chưa có thông tin nào được gửi.</Text>
        ) : (
          data.map((tmp, index) => (
            <View key={index} className="bg-white p-4 rounded-2xl shadow-md mb-4">
              <Text className="text-lg font-semibold text-black mb-2">Loại thông tin đã gửi:</Text>
              <Text className="text-black">{tmp.type=='image' ? 'Hình ảnh': tmp.type=='video' ? 'Video' : tmp.type== 'text' ? 'Văn bản' : 'Giọng nói'}</Text>

              {tmp.uploadTime ? (
                <>
                  <Text className="text-lg font-semibold text-black mt-4">Thời gian gửi:</Text>
                  <Text className="text-base text-black">
                    {new Date(tmp.uploadTime).toLocaleString('vi-VN')}
                  </Text>
                </>
              ) : null}

              {tmp.location ? (
                <>
                  <Text className="text-lg font-semibold text-black mt-4">Vị trí:</Text>
                  <Text className="text-base text-black">{tmp.location}</Text>
                </>
              ) : null}
            </View>
          ))
        )}

        {/* {isLoading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : images.length === 0 ? (
          <Text className={`text-center ${theme === "dark" ? "text-white" : "text-black"}`}>Chưa có ảnh nào được gửi.</Text>
        ) : (
          images.map((img, index) => (
            <View key={index} className="bg-white p-4 rounded-2xl shadow-md mb-4">
              <Text className="text-lg font-semibold text-black mb-2">Ảnh đã gửi:</Text>
              {img.base64 ? (
                <Image
                  source={{ uri: img.base64 }}
                  style={{ width: '100%', height: 200, borderRadius: 12 }}
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-red-500">Không thể hiển thị ảnh.</Text>
              )}

              {img.uploadTime ? (
                <>
                  <Text className="text-lg font-semibold text-black mt-4">Thời gian gửi:</Text>
                  <Text className="text-base text-black">
                    {new Date(img.uploadTime).toLocaleString('vi-VN')}
                  </Text>
                </>
              ) : null}

              {img.location ? (
                <>
                  <Text className="text-lg font-semibold text-black mt-4">Vị trí:</Text>
                  <Text className="text-base text-black">{img.location}</Text>
                </>
              ) : null}
            </View>
          ))
        )} */}
      </ScrollView>

      <NavigationBar />
    </ImageBackground>
  );
};

export default SubmittedReport;
