import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, ActivityIndicator, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import NavigationBar from '@/components/NavigationBar';
import Header from '@/components/Header';
import { useData } from '@/hooks/useData';
import { useTheme } from "@/hooks/useTheme";
import { useReport } from '@/hooks/useReport';

const SubmittedReport = () => {
  const { getDataDetail, getDataByUploader, isLoading } = useData();
  const { getReportByUploader, isLoading:isLoading2} = useReport();
  const [data, setData] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportDetail, setReportDetail] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDataByUploader();
        const res2 = await getReportByUploader();
        setReportData(res2);
        setData(res as any);
      } catch (error) {
        console.error('Error fetching submitted images:', error);
      }
    };
    fetchData();
  }, []);

  const openDetailModal = async (item: any) => {
    setModalVisible(true);
    setLoadingDetail(true);
    setDetail(null);
    try {
      setReportDetail(reportData.find( (r) => r.dataTextID === item._id || r.dataImgID === item._id  ));
      const res = await getDataDetail(item._id);
      setDetail(res);
    } catch (err) {
      console.error("Error fetching detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

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
        <Text
          className={`text-2xl font-bold text-center mb-4 ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          Thông tin đã gửi
        </Text>

        {isLoading || isLoading2 ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : data.length === 0 ? (
          <Text
            className={`text-center ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            Chưa có thông tin nào được gửi.
          </Text>
        ) : (
          data.map((tmp, index) => (
            <View
              key={index}
              className="bg-white p-4 rounded-2xl shadow-md mb-4"
            >
              <Text className="text-lg font-semibold text-black mb-2">
                Loại thông tin đã gửi:
              </Text>
              <Text className="text-black">
                {tmp.type == "image"
                  ? "Hình ảnh"
                  : tmp.type == "video"
                  ? "Video"
                  : tmp.type == "text"
                  ? "Văn bản"
                  : "Giọng nói"}
              </Text>

              {tmp.uploadTime ? (
                <>
                  <Text className="text-lg font-semibold text-black mt-4">
                    Thời gian gửi:
                  </Text>
                  <Text className="text-base text-black">
                    {new Date(tmp.uploadTime).toLocaleString("vi-VN")}
                  </Text>
                </>
              ) : null}

              {tmp.location ? (
                <>
                  <Text className="text-lg font-semibold text-black mt-4">
                    Vị trí:
                  </Text>
                  <Text className="text-base text-black">{tmp.location}</Text>
                </>
              ) : null}

              <TouchableOpacity
                className="mt-4 bg-blue-500 px-4 py-2 rounded-xl"
                onPress={() => {
                  openDetailModal(tmp);
                }}
              >
                <Text className="text-white text-center">Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-11/12 max-h-[80%]">
            <Text className="text-xl font-bold mb-4 text-black">
              Chi tiết thông tin
            </Text>

            {loadingDetail ? (
              <ActivityIndicator size="large" color="#000" />
            ) : detail ? (
              <ScrollView>
                {/* <Text className="text-black">ID: {detail.data._id}</Text> */}
                <Text className="text-black text-lg">Loại: {detail.data.type=='image'? 'Hình ảnh' : 'Văn bản'}</Text>

                {detail.data.uploadTime && (
                  <Text className="text-black mt-2 text-lg">
                    Thời gian: {new Date(detail.data.uploadTime).toLocaleString("vi-VN")}
                  </Text>
                )}

                {reportDetail && reportDetail?.statusID && (
                  <>
                    <Text className="text-black mt-2 text-lg">
                      Đánh giá: {(reportDetail.eval * 100).toFixed(0)}%
                    </Text>
                    <Text className="text-black mt-2 text-lg">
                      Kết quả:{" "}
                      {reportDetail.qualified ? "Đạt yêu cầu" : "Không đạt"}
                    </Text>
                  </>
                )}

                {reportDetail && !reportDetail?.statusID && (
                  <>
                    <Text className="text-black mt-2 text-lg">
                      Đánh giá: Chưa đánh giá
                    </Text>
                  </>
                )}
                <Text className="text-black mt-2 text-lg">
                  Vị trí: {reportDetail.lat}, {reportDetail.lon}
                </Text>
                {detail.data.type === "text" && detail.content?.content && (
                  <>
                    <Text className="text-black font-bold mt-4 text-lg">Nội dung văn bản:</Text>
                    <Text className="text-black">{detail.content.content}</Text>
                  </>
                )}

                {detail.data.type === "image" && detail.content?.content && (
                  <>
                    <Text className="text-black font-bold mt-4 text-lg">Ảnh đã gửi:</Text>
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${detail.content.content}` }}
                      style={{
                        width: "100%",
                        height: 200,
                        marginTop: 8,
                        borderRadius: 12,
                      }}
                      resizeMode="contain"
                    />
                  </>
                )}

                {detail.status && Object.keys(detail.status).length > 0 && (
                  <>
                    <Text className="text-black font-bold mt-4">Trạng thái xử lý:</Text>
                    <Text className="text-black">{JSON.stringify(detail.status)}</Text>
                  </>
                )}
              </ScrollView>
            ) : (
              <Text className="text-black">Không tải được chi tiết.</Text>
            )}

            <TouchableOpacity
              className="mt-6 bg-red-500 px-4 py-2 rounded-xl"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-center">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <NavigationBar />
    </ImageBackground>
  );
};

export default SubmittedReport;
