import React from "react";
import { TouchableOpacity, Text, GestureResponderEvent, ActivityIndicator, View } from "react-native";

interface Props {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  loadingTitle?: string;
}

export default function PrimaryButton({ title, onPress, disabled =false, loading = false, loadingTitle }: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      className="bg-[#1488DB] rounded-md py-3 items-center active:opacity-80"
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#fff" />
          <Text className="text-white font-bold text-base ml-2">{loadingTitle}</Text>
        </View>
      ) : (
        <Text className="text-white font-bold text-base">{title}</Text>
      )}
    </TouchableOpacity>
  );
}