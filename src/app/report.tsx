import React, { useState, useEffect } from 'react';
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
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from "expo-location";
import { Audio } from 'expo-av';
import Header from '@/components/Header';
import NavigationBar from '@/components/NavigationBar';
import PrimaryButton from '@/components/PrimaryButton';

const types = [
  { key: 'image', label: 'Hình ảnh', icon: require('@/asset/icons/image.png') },
  { key: 'video', label: 'Video', icon: require('@/asset/icons/video.png') },
  { key: 'audio', label: 'Âm thanh', icon: require('@/asset/icons/audio.png') },
  { key: 'text', label: 'Văn bản', icon: require('@/asset/icons/text.png') },
];

export default function ReportPage() {
  const [selectedType, setSelectedType] = useState<'image' | 'video' | 'audio' | 'text'>('image');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [textNote, setTextNote] = useState<string>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const fetchGPS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền bị từ chối", "Không thể truy cập GPS.");
      return;
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const locStr = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
    setLocation(locStr);
  };


  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Yêu cầu quyền', 'Vui lòng cho phép truy cập micro');
        return;
      }
  
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
  
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Lỗi ghi âm:', err);
    }
  };
  
  const stopRecording = async () => {
    try {
      if (!recording) return;
  
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
    } catch (err) {
      console.error('Lỗi khi dừng ghi âm:', err);
    }
  };
  
  const playSound = async () => {
    if (!recordedUri) return;

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordedUri }, {}, (status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      setSound(sound);
      setIsPlaying(true);
      await sound.playAsync();
    } catch (err) {
      console.error('Lỗi phát âm thanh:', err);
    }
  };

  // const pickFile = async (mediaType: 'Images' | 'Videos') => {
  //   const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  //   if (!permissionResult.granted) {
  //     Alert.alert('Yêu cầu quyền truy cập', 'Vui lòng cấp quyền để tiếp tục.');
  //     return;
  //   }

  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes:
  //       mediaType === 'Images'
  //         ? ImagePicker.MediaTypeOptions.Images
  //         : ImagePicker.MediaTypeOptions.Videos,
  //     allowsEditing: true,
  //     quality: 0.7,
  //   });

  //   if (!result.canceled && result.assets?.[0].uri) {
  //     mediaType === 'Images'
  //       ? setImageUri(result.assets[0].uri)
  //       : setVideoUri(result.assets[0].uri);
  //   }
  // };

  const pickFile = async (mediaType: 'Images' | 'Videos') => {
    const hasPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!hasPermission.granted) {
      Alert.alert('Yêu cầu quyền truy cập', 'Vui lòng cấp quyền để tiếp tục.');
      return;
    }
  
    const openCamera = async () => {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes:
          mediaType === 'Images'
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.7,
      });
  
      if (!result.canceled && result.assets?.[0].uri) {
        mediaType === 'Images'
          ? setImageUri(result.assets[0].uri)
          : setVideoUri(result.assets[0].uri);
      }
    };
  
    const openLibrary = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          mediaType === 'Images'
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.7,
      });
  
      if (!result.canceled && result.assets?.[0].uri) {
        mediaType === 'Images'
          ? setImageUri(result.assets[0].uri)
          : setVideoUri(result.assets[0].uri);
      }
    };
  
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Hủy', 'Chụp bằng camera', 'Chọn từ thư viện'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) openCamera();
          else if (buttonIndex === 2) openLibrary();
        }
      );
    } else {
      Alert.alert(
        'Chọn nguồn',
        'Bạn muốn sử dụng hình ảnh/video từ đâu?',
        [
          { text: 'Camera', onPress: openCamera },
          { text: 'Thư viện', onPress: openLibrary },
          { text: 'Hủy', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const handleSubmit = () => {
    const payload = {
      type: selectedType,
      image: imageUri,
      video: videoUri,
      textNote,
      description,
      location,
    };
    console.log('Data gửi:', payload);
    Alert.alert('Đã gửi!', 'Thông tin tình trạng giao thông đã được gửi.');
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
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
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
              {videoUri ? (
                <Text className="text-black text-center font-medium">
                  Video đã chọn: {videoUri.split('/').pop()}
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

            {recordedUri && (
              <View className="items-center">
                <Text className="text-black mb-2 text-center">
                  Đã ghi âm: {recordedUri.split('/').pop()}
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
              value={textNote}
              onChangeText={setTextNote}
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
      <NavigationBar />
    </ImageBackground>
  );
}
