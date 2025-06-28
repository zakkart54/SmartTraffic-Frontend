import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

interface Props extends TextInputProps { label: string; }

export default function TextInputField({ label, ...rest }: Props) {
  return (
    <View className="mb-5">
      <Text className="text-white font-semibold mb-1 text-base">{label}</Text>
      <TextInput
        className="border-b border-blue-400 text-white py-2 text-base"
        placeholderTextColor="#9CA3AF"
        {...rest}
      />
    </View>
  );
}