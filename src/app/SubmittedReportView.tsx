import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, ActivityIndicator, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import NavigationBar from '@/components/NavigationBar';
import Header from '@/components/Header';
import { useData } from '@/hooks/useData';
import { useTheme } from "@/hooks/useTheme";
import { useReport } from '@/hooks/useReport';

const SubmittedReport = () => {
  const { getDataDetail, getDataByUploader, isLoading } = useData();
  const { getReportByUploader, isLoading:isLoading2 } = useReport();
  const [data, setData] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportDetail, setReportDetail] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [detail, setDetail] = useState<any>(null);
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

  const openDetailModal = async (report: any) => {
    setModalVisible(true);
    setLoadingDetail(true);
    setDetail(null);
    setReportDetail(report);

    try {
      const detailPromises = [];
      
      if (report.dataTextID) {
        detailPromises.push(getDataDetail(report.dataTextID));
      }
      
      if (report.dataImgID) {
        detailPromises.push(getDataDetail(report.dataImgID));
      }

      const details = await Promise.all(detailPromises);
      
      const combinedDetail = {
        textDetail: report.dataTextID ? details[0] : null,
        imageDetail: report.dataImgID ? (report.dataTextID ? details[1] : details[0]) : null
      };
      
      setDetail(combinedDetail);
    } catch (err) {
      console.error("Error fetching detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const { theme } = useTheme();

  const getDataInfo = (report: any) => {
    const textData = data.find(d => d._id === report.dataTextID);
    const imageData = data.find(d => d._id === report.dataImgID);
    
    const types = [];
    if (textData) types.push('Văn bản');
    if (imageData) types.push('Hình ảnh');
    
    const uploadTime = textData?.uploadTime || imageData?.uploadTime;
    const location = textData?.location || imageData?.location;
    
    return { types, uploadTime, location };
  };

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
        ) : reportData.length === 0 ? (
          <Text
            className={`text-center ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            Chưa có thông tin nào được gửi.
          </Text>
        ) : (
          reportData.map((report, index) => {
            const { types, uploadTime } = getDataInfo(report);
            
            return (
              <View
                key={index}
                className="bg-white p-4 rounded-2xl shadow-md mb-4"
              >
                <Text className="text-lg font-semibold text-black mb-2">
                  Loại thông tin đã gửi:
                </Text>
                <Text className="text-black">
                  {types.join(' + ')}
                </Text>

                {uploadTime ? (
                  <>
                    <Text className="text-lg font-semibold text-black mt-4">
                      Thời gian gửi:
                    </Text>
                    <Text className="text-base text-black">
                      {new Date(report.createdDate).toLocaleString("vi-VN")}
                    </Text>
                  </>
                ) : null}

                <Text className="text-lg font-semibold text-black mt-4">
                  Vị trí:
                </Text>
                <Text className="text-base text-black">
                  {report.lat}, {report.lon}
                </Text>

                <Text className="text-lg font-semibold text-black mt-4">
                  Trạng thái:
                </Text>
                <Text className="text-base text-black">
                  {report.statusID ? (
                    <>
                      Đánh giá: {(report.eval * 100).toFixed(0)}% - {report.qualified ? "Đạt yêu cầu" : "Không đạt"}
                    </>
                  ) : (
                    "Chưa đánh giá"
                  )}
                </Text>

                <TouchableOpacity
                  className="mt-4 bg-blue-500 px-4 py-2 rounded-xl"
                  onPress={() => {
                    openDetailModal(report);
                  }}
                >
                  <Text className="text-white text-center">Xem chi tiết</Text>
                </TouchableOpacity>
              </View>
            );
          })
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
                <Text className="text-black text-lg font-semibold">Thông tin báo cáo:</Text>
                
                <Text className="text-black mt-2 text-lg">
                  Vị trí: {reportDetail.lat}, {reportDetail.lon}
                </Text>

                <Text className="text-black mt-2 text-lg">
                  Thời gian tạo: {new Date(reportDetail.createdDate).toLocaleString("vi-VN")}
                </Text>

                {reportDetail?.statusID ? (
                  <>
                    <Text className="text-black mt-2 text-lg">
                      Đánh giá: {(reportDetail.eval * 100).toFixed(0)}%
                    </Text>
                    <Text className="text-black mt-2 text-lg">
                      Kết quả: {reportDetail.qualified ? "Đạt yêu cầu" : "Không đạt"}
                    </Text>
                  </>
                ) : (
                  <Text className="text-black mt-2 text-lg">
                    Đánh giá: Chưa đánh giá
                  </Text>
                )}

                {detail.textDetail && (
                  <>
                    <Text className="text-black font-bold mt-6 text-lg">Nội dung văn bản:</Text>
                    {/* <Text className="text-black mt-2">
                      Thời gian tải lên: {new Date(detail.textDetail.data.uploadTime).toLocaleString("vi-VN")}
                    </Text> */}
                    {detail.textDetail.content?.content && (
                      <Text className="text-black mt-2">{detail.textDetail.content.content}</Text>
                    )}
                  </>
                )}

                {detail.imageDetail && (
                  <>
                    <Text className="text-black font-bold mt-6 text-lg">Ảnh đã gửi:</Text>
                    {/* <Text className="text-black mt-2">
                      Thời gian tải lên: {new Date(detail.imageDetail.data.uploadTime).toLocaleString("vi-VN")}
                    </Text> */}
                    {detail.imageDetail.content?.content && (
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${detail.imageDetail.content.content}` }}
                        style={{
                          width: "100%",
                          height: 200,
                          marginTop: 8,
                          borderRadius: 12,
                        }}
                        resizeMode="contain"
                      />
                    )}
                  </>
                )}

                {(detail.textDetail?.status?.statuses || detail.imageDetail?.status?.statuses) && (
                  <>
                    <Text className="text-black font-bold mt-6 text-lg">Kết quả xử lý:</Text>
                    {Object.entries(
                      detail.textDetail?.status?.statuses || detail.imageDetail?.status?.statuses || {}
                    ).map(([key, value]) => {
                      if (!value) return null;
                      let label = '';
                      switch (key) {
                        case 'ObstaclesFlag':
                          label = 'Chướng ngại vật';
                          break;
                        case 'FloodedFlag':
                          label = 'Ngập nước';
                          break;
                        case 'PoliceFlag':
                          label = 'Có CSGT';
                          break;
                        case 'TrafficJamFlag':
                          label = 'Ùn tắc';
                          break;
                        default:
                          label = key;
                      }
                      return (
                        <Text key={key} className="text-black ml-2 mt-1">
                          • {label}
                        </Text>
                      );
                    })}
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