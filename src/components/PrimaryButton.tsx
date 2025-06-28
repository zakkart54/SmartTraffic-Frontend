import React from "react";
import { TouchableOpacity, Text, GestureResponderEvent } from "react-native";

interface Props {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
}

export default function PrimaryButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity
      className="bg-[#1488DB] rounded-md py-3 items-center active:opacity-80"
      onPress={onPress}
    >
      <Text className="text-white font-bold text-base">{title}</Text>
    </TouchableOpacity>
  );
}