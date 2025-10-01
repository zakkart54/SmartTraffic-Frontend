import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
  Linking,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  useAudioRecorder,
  useAudioPlayer,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import Header from '@/components/Header';
import NavigationBar from '@/components/NavigationBar';
import PrimaryButton from '@/components/PrimaryButton';
import { useData } from '@/hooks/useData';
import { useReport } from '@/hooks/useReport';
// import { format } from "date-fns";
import { useTheme } from "@/hooks/useTheme";
import {useAuth} from "../hooks/useAuth";

const types = [
  { key: 'image', label: 'Hình ảnh', icon: require('@/asset/icons/image.png') },
  { key: 'video', label: 'Video', icon: require('@/asset/icons/video.png') },
  { key: 'audio', label: 'Âm thanh', icon: require('@/asset/icons/audio.png') },
  { key: 'text', label: 'Văn bản', icon: require('@/asset/icons/text.png') },
] as const;

type TypeKey = typeof types[number]['key'];

export default function ReportPage() {
  const { theme } = useTheme();
  const { accessToken } = useAuth();
  const [selectedType, setSelectedType] = useState<TypeKey>('image');
  const [dataUri, setDataUri] = useState<string | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  // const [description, setDescription] = useState('');
  // const [location, setLocation] = useState('');
  const player = useAudioPlayer({ uri: dataUri || '' });
  const [isLoading, setIsLoading] = useState(false);
  // const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const { addImageData, addTextData } = useData();
  const {addReport} = useReport();
  // const { addImage, isLoading} = useImage();

  useEffect(() => {
    setDataUri('');
  }, [selectedType]);

  const fetchGPS = async () => {
    try {
      // setIsFetchingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền bị từ chối',
          'Không thể truy cập GPS. Vui lòng kiểm tra cài đặt quyền ứng dụng và bật quyền truy cập vị trí.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      return [
        parseFloat(pos.coords.latitude.toFixed(6)),
        parseFloat(pos.coords.longitude.toFixed(6)),
      ];
    } catch (error) {
      console.error('Lỗi lấy vị trí:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại.');
    } finally {
      // setIsFetchingLocation(false);
    }
  };

  const startRecording = async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Micro không được cấp quyền');
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err) {
      console.error('Lỗi khi bắt đầu ghi âm:', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      const result = await recorder.getStatus();
      if (result) {
        setDataUri(result.url);
      }
    } catch (err) {
      console.error('Lỗi khi dừng ghi âm:', err);
    }
  };

  const playAudio = async () => {
    try {
      await player.seekTo(0);
      await player.play();
    } catch (err) {
      console.error('Lỗi khi phát audio:', err);
    }
  };

  const pickFile = async (mediaType: 'Images' | 'Videos') => {
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!cameraPerm.granted || !libraryPerm.granted) {
      Alert.alert('Yêu cầu quyền truy cập', 'Vui lòng cấp quyền để tiếp tục.');
      return;
    }

    const launch = async (fromCamera: boolean) => {
      const picker = fromCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
      const result = await picker({
        mediaTypes: mediaType === 'Images' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.[0].uri) {
        setDataUri(result.assets[0].uri);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Hủy', 'Chụp bằng camera', 'Chọn từ thư viện'],
          cancelButtonIndex: 0,
        },
        idx => {
          if (idx === 1) launch(true);
          else if (idx === 2) launch(false);
        },
      );
    } else {
      Alert.alert(
        'Chọn nguồn',
        'Bạn muốn sử dụng hình ảnh/video từ đâu?',
        [
          { text: 'Camera', onPress: () => launch(true) },
          { text: 'Thư viện', onPress: () => launch(false) },
          { text: 'Hủy', style: 'cancel' },
        ],
        { cancelable: true },
      );
    }
  };

  const handleSubmit = async () => {
    if (selectedType === 'video' || selectedType === 'audio') {
      Alert.alert('Thông báo', 'Ứng dụng chưa hỗ trợ gửi video và âm thanh');
    }
    if (!accessToken){
      Alert.alert('Thông báo','Vui lòng đăng nhập để gửi tình trạng.');
      return;
    }

    if (!dataUri) {
      Alert.alert('Thông báo', 'Vui lòng điền thông tin.');
      return;
    }

    setIsLoading(true);
    const gps = await fetchGPS();
    if (!gps) {
      Alert.alert('Thông báo', 'Yêu cầu quyền truy cập GPS để gửi tình trạng.');
      setIsLoading(false);
      return;
    }
  
    try {
      if (selectedType=='image') {
        const data = await addImageData(dataUri);
        await addReport({
          dataImgID: data.dataID,
          lat: gps[0],
          lon: gps[1],
        });
        Alert.alert('Thành công', 'Hình ảnh đã được gửi.');
      }
      else if (selectedType === 'text') {
        const data = await addTextData(dataUri);
        await addReport({
          dataTextID: data.dataID,
          lat: gps[0],
          lon: gps[1],
        });
        Alert.alert('Thành công', 'Văn bản đã được gửi.');
      }
      setIsLoading(false);
      setDataUri('');
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      Alert.alert('Lỗi', err.message || 'Không thể gửi hình ảnh.');
    }
  };
  
  return (
    <ImageBackground
      source={
        theme === "dark"
          ? require("@/asset/background.png")
          : require("@/asset/background1.png")
      }
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <Header hideMenu={true}/>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="flex-1 px-4 pt-8 mt-4 justify-between">

        <View className="mt-4 mb-2">
        <Text className={`text-4xl font-bold text-center ${theme === "dark" ? "text-white" : "text-[#063970]"}`}>Gửi tình trạng</Text>
        </View>

        <View className="bg-blue-300 p-4 rounded-xl flex-row justify-between mb-4">
          {/* {types.map((item) => (
            <TouchableOpacity
              key={item.key}
              className={`items-center px-2 ${
                selectedType === item.key ? 'opacity-100' : 'opacity-60'
              }`}
              onPress={() => setSelectedType(item.key as any)}
            >
              <Image source={item.icon} className="w-8 h-8 mb-1" />
              <Text className="text-black font-semibold">{item.label}</Text>
            </TouchableOpacity>
          ))} */}
          {types.map((item) => (
            <TouchableOpacity
              key={item.key}
              className={`items-center px-2 ${
                selectedType === item.key ? 'opacity-100' : 'opacity-70'
              }`}
              onPress={() => setSelectedType(item.key as any)}
            >
              <Image source={item.icon} className="w-8 h-8 mb-1" />
              <Text className="text-black font-semibold">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedType === 'image' ? (
          <View className="bg-[#edf2fc] rounded-xl mb-4 justify-center items-center min-h-[300px]">
            <TouchableOpacity onPress={() => pickFile('Images')} className="items-center">
              {dataUri ? (
                <Image
                  source={{ uri: dataUri }}
                  className="w-48 h-48 rounded-lg mb-2"
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Image
                    source={require('@/asset/icons/image.png')}
                    className="w-12 h-12 mb-2"
                    resizeMode="contain"
                  />
                  <Text className="text-gray-700 text-base font-medium text-center">
                    Chọn tệp ảnh tình trạng giao thông
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {selectedType === 'video' ? (
          <View className="bg-[#edf2fc] rounded-xl mb-4 justify-center items-center min-h-[300px]">
            <TouchableOpacity onPress={() => pickFile('Videos')} className="items-center">
              {dataUri ? (
                <Text className="text-black text-center font-medium">
                  Video đã chọn: {dataUri.split('/').pop()}
                </Text>
              ) : (
                <>
                  <Image
                    source={require('@/asset/icons/video.png')}
                    className="w-12 h-12 mb-2"
                    resizeMode="contain"
                  />
                  <Text className="text-gray-700 text-base font-medium text-center">
                    Chọn tệp video tình trạng giao thông
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {selectedType === 'audio' ? (
          <View className="bg-[#edf2fc] rounded-xl mb-4 justify-center items-center min-h-[300px] p-4">
            <TouchableOpacity
              className="bg-blue-500 rounded-md px-4 py-2 mb-3"
              onPress={recorderState.isRecording ? stopRecording : startRecording}
            >
              <Text className="text-white font-bold">
                {recorderState.isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
              </Text>
            </TouchableOpacity>

            {(dataUri && !recorderState.isRecording) ? (
              <View className="items-center">
                <Text className="text-black mb-2 text-center">
                  Đã ghi âm: {dataUri.split('/').pop()}
                </Text>
                <TouchableOpacity
                  className="bg-green-500 rounded-md px-4 py-2 mb-2"
                  onPress={playAudio}
                  disabled={player.playing}
                >
                  <Text className="text-white font-bold">
                    {player.playing ? 'Đang phát...' : 'Phát lại'}
                  </Text>
                </TouchableOpacity>
                {player.playing ? <ActivityIndicator size="small" color="#10b981" /> : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {selectedType === 'text' ? (
          <View className="bg-[#edf2fc] rounded-xl mb-4 min-h-[300px]">
            <TextInput
              placeholder="Nhập mô tả tình trạng giao thông bằng văn bản"
              placeholderTextColor="#6b7280"
              value={dataUri}
              onChangeText={setDataUri}
              className="text-black p-2 flex-1"
              multiline
            />
          </View>
        ) : null}

        {/* <TextInput
          placeholder="Mô tả thêm tình trạng"
          placeholderTextColor="#6b7280"
          value={description}
          onChangeText={setDescription}
          className="bg-[#edf2fc] text-black rounded-xl px-4 py-3 mb-4"
        /> */}

        {/* <View className="flex-row items-center bg-[#edf2fc] rounded-xl px-2 py-3 mb-4">
          <TextInput
            placeholder="Vị trí phát hiện"
            placeholderTextColor="#6b7280"
            value={location}
            onChangeText={setLocation}
            className="flex-1 text-black mr-2"
          />
          <TouchableOpacity onPress={fetchGPS} className="bg-blue-500 rounded-md px-3 py-2 active:opacity-80">
            <Text className="text-white text-sm font-bold">GPS</Text>
          </TouchableOpacity>
        </View> */}

        <View className="mb-4 px-16">
          <PrimaryButton title="Gửi tình trạng" loadingTitle = "Đang gửi dữ liệu" onPress={handleSubmit} disabled={isLoading}/>
        </View>
      </View>

      {isLoading ? (
        <View className="absolute inset-0 bg-black/40 justify-center items-center z-50">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-2">Đang gửi dữ liệu...</Text>
        </View>
      ) : null}
      </ScrollView>
      <NavigationBar />

    </ImageBackground>
  );
}
