import { View, Text, ImageBackground, TextInput,} from 'react-native';
import NavigationBar from '@/components/NavigationBar';
import { useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';

export default function DetailStatus() {
  const { status } = useLocalSearchParams();
  const statusData = status ? JSON.parse(status as string) : null;

  if (!statusData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-black">Không có dữ liệu tình trạng</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('@/asset/background.png')}
      resizeMode="cover"
      style={{ flex: 1, width: '100%', height: '100%' }}
    >
      <Header />
      <View className="flex-1 px-4 pt-4">
        {/* Tình trạng */}
        <View className="mb-4">
          <Text className="text-white text-2xl font-bold text-center">Tình trạng</Text>
          <View className="bg-[#edf2fc] p-4 rounded-xl mt-2 items-center">
            <Text className="text-black-800 text-lg font-bold">{statusData.time}</Text>
            <Text className="text-black text-base mt-1">{statusData.name}</Text>
          </View>
        </View>
        <View className="mb-4">
          <View className="bg-[#edf2fc] p-4 rounded-xl mt-2 items-center">
            <Text className="text-black text-1xl font-bold text-center">Độ tin cậy</Text>
            <Text
              className={`text-xl font-bold mt-2 ${
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
        

        {/* Chi tiết tình trạng */}
        <View className="mb-4">
          <Text className="text-white text-2xl font-bold text-center">Chi tiết tình trạng</Text>
          {/* <View className="bg-[#edf2fc] p-4 rounded-xl mt-2 items-center">
            <Image
              source={statusData.image}
              className="w-24 h-24 rounded-lg"
              resizeMode="contain"
            />
          </View> */}
          <View className="bg-[#edf2fc] p-2 rounded-xl mt-2">
            <TextInput
              value={statusData.description}
              editable={false}
              multiline
              className="text-black p-2"
            />
          </View>
        </View>

        {/* Mô tả tình trạng */}
        <View className="mb-4">
          <Text className="text-white text-2xl font-bold text-center">Mô tả tình trạng</Text>
          <View className="bg-[#edf2fc] p-2 rounded-xl mt-2">
            <TextInput
              value={statusData.description}
              editable={false}
              multiline
              className="text-black p-2"
            />
          </View>
        </View>

        {/* Vị trí phát hiện */}
        <View className="mb-4">
          <Text className="text-white text-2xl font-bold text-center">Vị trí phát hiện</Text>
          <View className="bg-[#edf2fc] p-4 rounded-xl mt-2">
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-black text-sm">Kinh độ</Text>
                <Text className="text-black text-lg font-bold">
                  {statusData.location.longitude}
                </Text>
                <Text className="text-black">{statusData.location.longitudeDir}</Text>
              </View>
              <View className="items-center">
                <Text className="text-black text-sm">Vĩ độ</Text>
                <Text className="text-black text-lg font-bold">
                  {statusData.location.latitude}
                </Text>
                <Text className="text-black">{statusData.location.latitudeDir}</Text>
              </View>
            </View>
            <View className="items-center mt-2">
              <Text className="text-black text-base">{statusData.location.street}</Text>
            </View>
          </View>
        </View>
      </View>
      <NavigationBar />
    </ImageBackground>
  );
}
