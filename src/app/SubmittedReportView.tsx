import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import NavigationBar from '@/components/NavigationBar';
import Header from '@/components/Header';
import { useImage } from '@/hooks/useImage';

const SubmittedReport = () => {
  const { getImagesByUploaderId, isLoading } = useImage();
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getImagesByUploaderId();

        // Convert image blobs to base64
        const base64Images = await Promise.all(
          data.map(async (img) => {
            if (!img.imageBlob) return { ...img, base64: null };

            const base64 = await blobToBase64(img.imageBlob);
            return { ...img, base64 };
          })
        );

        console.log('Fetched submitted images with base64:', base64Images);
        setImages(base64Images);
      } catch (error) {
        console.error('Error fetching submitted images:', error);
      }
    };

    fetchImages();
  }, []);

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // base64 URI
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <ImageBackground
      source={require('@/asset/background.png')}
      resizeMode="cover"
      style={{ flex: 1, width: '100%', height: '100%' }}
    >
      <Header />

      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-white text-2xl font-bold text-center mb-4">Thông tin đã gửi</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : images.length === 0 ? (
          <Text className="text-white text-center">Chưa có ảnh nào được gửi.</Text>
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
        )}
      </ScrollView>

      <NavigationBar />
    </ImageBackground>
  );
};

export default SubmittedReport;
