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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import Header from '@/components/Header';
import NavigationBar from '@/components/NavigationBar';
import PrimaryButton from '@/components/PrimaryButton';
import { useData } from '@/hooks/useData';
import { format } from "date-fns";

const types = [
  { key: 'image', label: 'Hình ảnh', icon: require('@/asset/icons/image.png') },
  { key: 'video', label: 'Video', icon: require('@/asset/icons/video.png') },
  { key: 'audio', label: 'Âm thanh', icon: require('@/asset/icons/audio.png') },
  { key: 'text', label: 'Văn bản', icon: require('@/asset/icons/text.png') },
] as const;

type TypeKey = typeof types[number]['key'];

export default function ReportPage() {
  const [selectedType, setSelectedType] = useState<TypeKey>('image');
  const [dataUri, setDataUri] = useState<string | null>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const { addImageData, isLoading } = useData();

  const clearMedia = useCallback(() => {
    setDataUri('');
    // if (recording) {
    //   recording.stopAndUnloadAsync().catch(() => undefined);
    //   setRecording(null);
    // }
    // if (sound) {
    //   sound.unloadAsync().catch(() => undefined);
    //   setSound(null);
    //   setIsPlaying(false);
    // }
  }, []);

  useEffect(() => {
    clearMedia();
  }, [selectedType, clearMedia]);
  
  useEffect(() => {
    return () => {
      sound?.unloadAsync();
      recording?.stopAndUnloadAsync();
    };
  }, [sound, recording]);

  const fetchGPS = async () => {
    try {
      setIsFetchingLocation(true);
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
      setLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
    } catch (error) {
      console.error('Lỗi lấy vị trí:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại.');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Yêu cầu quyền', 'Vui lòng cho phép truy cập micro');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(rec);
    } catch (err) {
      console.error('Lỗi ghi âm:', err);
      Alert.alert('Lỗi', 'Không thể bắt đầu ghi âm. Vui lòng thử lại.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setDataUri(uri ?? null);
      setRecording(null);
    } catch (err) {
      console.error('Lỗi khi dừng ghi âm:', err);
    }
  };

  const playSound = async () => {
    if (!dataUri) return;
    try {
      setIsPlaying(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        {},
        status => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        },
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (err) {
      console.error('Lỗi phát âm thanh:', err);
      Alert.alert('Lỗi', 'Không thể phát âm thanh.');
      setIsPlaying(false);
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
    const valid = selectedType === 'image' && dataUri;
  
    if (!valid) {
      Alert.alert('Lỗi', 'Vui lòng chọn hình ảnh và điền thông tin.');
      return;
    }
  
    try {
      const fileName = dataUri!.split('/').pop()!;
      const file: File | Blob = {
        uri: dataUri!,
        name: fileName,
        type: 'image/jpeg',
      } as any;
  
      await addImageData({
        type: 'image',
        uploadTime: format(new Date(), 'yyyy/MM/dd'),
        location
      }, file);
  
      Alert.alert('Thành công', 'Hình ảnh đã được gửi.');
      clearMedia();
      setDescription('');
      setLocation('');
      setDataUri('');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Lỗi', err.message || 'Không thể gửi hình ảnh.');
    }
  };
  
  return (
    <ImageBackground
      source={require('@/asset/background.png')}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <Header />

      <View className="flex-1 bg-blue-900/90 px-4 pt-4 justify-between">

        <View className="mt-4 mb-2">
          <Text className="text-white text-2xl font-bold text-center">Gửi tình trạng</Text>
        </View>

        <View className="bg-blue-200 p-4 rounded-xl flex-row justify-between mb-4">
          {types.map((item) => (
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
          ))}
        </View>

        {selectedType === 'image' && (
          <View className="bg-[#edf2fc] rounded-xl mb-4 justify-center items-center min-h-[100px]">
            <TouchableOpacity onPress={() => pickFile('Images')} className="items-center">
              {dataUri ? (
                <Image
                  source={{ uri: dataUri }}
                  className="w-24 h-24 rounded-lg mb-2"
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
        )}

        {selectedType === 'video' && (
          <View className="bg-[#edf2fc] rounded-xl mb-4 justify-center items-center min-h-[100px]">
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
        )}

        {selectedType === 'audio' && (
          <View className="bg-[#edf2fc] rounded-xl mb-4 justify-center items-center min-h-[100px] p-4">
            <TouchableOpacity
              className="bg-blue-500 rounded-md px-4 py-2 mb-3"
              onPress={recording ? stopRecording : startRecording}
            >
              <Text className="text-white font-bold">
                {recording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
              </Text>
            </TouchableOpacity>

            {(dataUri && !recording) && (
              <View className="items-center">
                <Text className="text-black mb-2 text-center">
                  Đã ghi âm: {dataUri.split('/').pop()}
                </Text>
                <TouchableOpacity
                  className="bg-green-500 rounded-md px-4 py-2 mb-2"
                  onPress={playSound}
                  disabled={isPlaying}
                >
                  <Text className="text-white font-bold">
                    {isPlaying ? 'Đang phát...' : 'Phát lại'}
                  </Text>
                </TouchableOpacity>
                {isPlaying && <ActivityIndicator size="small" color="#10b981" />}
              </View>
            )}
          </View>
        )}

        {selectedType === 'text' && (
          <View className="bg-[#edf2fc] rounded-xl mb-4 min-h-[100px]">
            <TextInput
              placeholder="Nhập mô tả tình trạng giao thông bằng văn bản"
              placeholderTextColor="#6b7280"
              value={dataUri}
              onChangeText={setDataUri}
              className="text-black p-2 flex-1"
              multiline
            />
          </View>
        )}

        <TextInput
          placeholder="Mô tả thêm tình trạng"
          placeholderTextColor="#6b7280"
          value={description}
          onChangeText={setDescription}
          className="bg-[#edf2fc] text-black rounded-xl px-4 py-3 mb-4"
        />

        <View className="flex-row items-center bg-[#edf2fc] rounded-xl px-2 py-3 mb-4">
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
        </View>

        <View className="mb-4">
          <PrimaryButton title="Gửi tình trạng" onPress={handleSubmit} />
        </View>
      </View>

      {isLoading && (
        <View className="absolute inset-0 bg-black/40 justify-center items-center z-50">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-2">Đang gửi dữ liệu...</Text>
        </View>
      )}
      <NavigationBar />

    </ImageBackground>
  );
}
