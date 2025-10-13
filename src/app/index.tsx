import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import NavigationBar from '@/components/NavigationBar';
import { router } from "expo-router";
import Header from '@/components/Header';
import { useTheme } from '@/hooks/useTheme';
import { useAppSettings } from '@/hooks/useAppSetting';
import { useSegment } from "@/hooks/useSegment";
import { useReport } from "@/hooks/useReport";
import * as Location from 'expo-location';

interface ReportWithSegment {
  _id: string;
  createdDate: string;
  dataImgID: string;
  dataTextID: string;
  eval: number;
  lat: number;
  lon: number;
  qualified: boolean;
  segmentID: string;
  statusID: string;
  uploaderID: string;
  segmentName?: string;
  currentStatus?: {
    FLOOD: boolean;
    JAM: boolean;
    OBSTACLE: boolean;
    POLICE: boolean;
  };
}

export default function HomePage() {
  const { theme } = useTheme();
  const { location } = useAppSettings();
  const { findSegmentByGPS, getSegmentById } = useSegment();
  const { getReportByGps, isLoading: reportsLoading, error: reportsError } = useReport();
  const [reports, setReports] = useState<ReportWithSegment[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(false);
  
  const [streetName, setStreetName] = useState<string>("");
  const [coords, setCoords] = useState<{
    latitude: string;
    longitude: string;
    latitudeDir: string;
    longitudeDir: string;
  } | null>(null);

  const [permission, setPermission] = useState('granted');

  // const getCurrentHourStatus = (statusArray: any[]) => {
  //   const currentHour = new Date().getHours();
  //   if (statusArray && statusArray.length > 0) {
  //     return statusArray[currentHour] || statusArray[0];
  //   }
  //   return { FLOOD: false, JAM: false, OBSTACLE: false, POLICE: false };
  // };

  // const formatStatus = (status: any) => {
  //   const statuses = [];
  //   if (status.JAM) statuses.push('🚗 Kẹt xe');
  //   if (status.FLOOD) statuses.push('🌊 Ngập nước');
  //   if (status.OBSTACLE) statuses.push('⚠️ Chướng ngại');
  //   if (status.POLICE) statuses.push('👮 Cảnh sát');
  //   return statuses.length > 0 ? statuses.join(' • ') : '✅ Thông thoáng';
  // };

  useEffect(() => {
    async function getLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setPermission('denied');
          return;
        }
        setPermission("granted");
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
      
        const { latitude, longitude } = location.coords;
  
        const latitudeDir = latitude >= 0 ? "Bắc" : "Nam";
        const longitudeDir = longitude >= 0 ? "Đông" : "Tây";
  
        setCoords({
          latitude: Math.abs(latitude).toFixed(6),
          longitude: Math.abs(longitude).toFixed(6),
          latitudeDir,
          longitudeDir,
        });
        return [latitude, longitude];
      } catch (err: any) {
        setPermission('denied');
        console.warn("Lỗi khi lấy vị trí:", err.message);
      }
    }
    
    async function handleLocation() {
      if (location) {
        const [lat, lon] = location;

        const latitudeDir = lat >= 0 ? "Bắc" : "Nam";
        const longitudeDir = lon >= 0 ? "Đông" : "Tây";

        setCoords({
          latitude: `${Math.abs(lat).toFixed(4)}°`,
          longitude: `${Math.abs(lon).toFixed(4)}°`,
          latitudeDir,
          longitudeDir,
        });
        return [lat, lon];
      } else {
        const [lat,lon]= await getLocation();
        return [lat, lon];
      }
    }

    (async () => {
      try {
        const [lat, lon] = await handleLocation();
        if (lat) setStreetName("Đang tìm tên đường...");
        
        const [segment, reportsData] = await Promise.all([
          findSegmentByGPS(lat, lon),
          getReportByGps(lat, lon),
        ]);
        if (reportsData && reportsData.length > 0) {
          setLoadingSegments(true);
          const reportsWithSegments = await Promise.all(
            reportsData.map(async (report: any) => {
              try {
                const segmentData = await getSegmentById(report.segmentID);
                return {
                  ...report,
                  segmentName: segmentData?.tags?.name || 'Không xác định',
                  // currentStatus: getCurrentHourStatus(segmentData?.status),
                };
              } catch (err) {
                console.warn(`Không thể lấy segment ${report.segmentID}:`, err);
                return {
                  ...report,
                  segmentName: 'Không xác định',  
                  // currentStatus: { FLOOD: false, JAM: false, OBSTACLE: false, POLICE: false },
                };
              }
            })
          );
          setReports(reportsWithSegments);
          setLoadingSegments(false);
        } else {
          setReports([]);
        }

        const streetName = segment?.tags?.name;
        if (streetName) {
          setStreetName(`${streetName}`);
        } else {
          setStreetName("Không tìm thấy tên đường");
        }
      } catch (err) {
        setStreetName("Không tìm thấy tên đường");
      }
    })();
  }, [location]);

  const formatDate = (dateString: string) => {
    const date = new Date (dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${hours}:${minutes} - ${day}/${month}/${date.getFullYear()}`;
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
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-1 px-4 pt-4 justify-evenly">
          <View className="mt-20">
            <Text className={`text-4xl font-bold text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>
              Vị trí hiện tại
            </Text>

            <View className="bg-[#edf2fc] p-8 rounded-2xl mt-4">
              {permission === "denied" ? (
                <Text className="text-center text-lg text-red-600">
                  Không thể lấy vị trí — bạn chưa cấp quyền truy cập vị trí.
                </Text>
              ) : coords ? (
                <>
                  <View className="flex-row justify-between">
                    <View className="items-center mt-2">
                      <Text className="text-[#063970] text-xl">Vĩ độ</Text>
                      <Text className="text-[#063970] text-3xl font-bold">
                        {coords.latitude}
                      </Text>
                      <Text className="text-[#063970] text-xl">
                        {coords.latitudeDir}
                      </Text>
                    </View>
                    <View className="items-center mt-2">
                      <Text className="text-[#063970] text-xl">Kinh độ</Text>
                      <Text className="text-[#063970] text-3xl font-bold">
                        {coords.longitude}
                      </Text>
                      <Text className="text-[#063970] text-xl">
                        {coords.longitudeDir}
                      </Text>
                    </View>
                  </View>
                  <View className="items-center mt-2">
                    <Text className="text-[#063970] text-2xl font-bold">
                      {streetName}
                    </Text>
                  </View>
                </>
              ) : (
                <Text className="text-center text-lg text-gray-600">
                  Đang lấy vị trí...
                </Text>
              )}
            </View>
          </View>

          <View className="mt-20">
            <Text className={`text-4xl font-bold text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>
              Báo cáo giao thông
            </Text>
            
            {reportsLoading || loadingSegments ? (
              <View className="bg-[#edf2fc] p-6 rounded-xl mt-4">
                <ActivityIndicator size="large" color="#063970" />
                <Text className="text-center text-[#063970] mt-2">
                  {loadingSegments ? 'Đang tải thông tin đường...' : 'Đang tải dữ liệu...'}
                </Text>
              </View>
            ) : reportsError ? (
              <View className="bg-[#edf2fc] p-6 rounded-xl mt-4">
                <Text className="text-center text-red-600">{reportsError}</Text>
              </View>
            ) : reports.length === 0 ? (
              <View className="bg-[#edf2fc] p-6 rounded-xl mt-4">
                <Text className="text-center text-[#063970]">Chưa có báo cáo nào</Text>
              </View>
            ) : (
              reports.map((report) => (
                <TouchableOpacity
                  key={report._id}
                  onPress={() =>
                    router.push({
                      pathname: '/DetailStatus',
                      params: { 
                        reportId: report._id,
                        report: JSON.stringify(report)
                      },
                    })
                  }
                >
                  <View className="bg-[#edf2fc] mb-2 p-6 rounded-xl mt-4">
                    <Text className="text-[#063970] text-2xl font-bold mb-2">
                      {report.segmentName ? `Đường ${report.segmentName}` : 'Không xác định'}
                    </Text>
                    
                    {/* {report.currentStatus && (
                      <Text className="text-[#063970] text-base font-semibold mb-1">
                        {formatStatus(report.currentStatus)}
                      </Text>
                    )} */}
                      <Text className="text-[#063970] text-base font-semibold mb-1">
                        Có tình trạng giao thông mới
                      </Text>
                    
                    <Text className="text-[#063970] text-base">
                      Vị trí: {report.lat.toFixed(6)}, {report.lon.toFixed(6)}
                    </Text>
                    <Text className="text-[#063970] text-base">
                      Thời gian: {formatDate(report.createdDate)}
                    </Text>
                    <Text className="text-[#063970] text-base">
                      Độ tin cậy: {(report.eval * 100).toFixed(0)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <NavigationBar />
    </ImageBackground>
  );
}