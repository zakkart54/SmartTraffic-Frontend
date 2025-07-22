import React from "react";
import { TouchableOpacity, Text, GestureResponderEvent } from "react-native";

interface Props {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
}

export default function PrimaryButton({ title, onPress, disabled =false }: Props) {
  return (
    <TouchableOpacity
      className="bg-[#1488DB] rounded-md py-3 items-center active:opacity-80"
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="text-white font-bold text-base">{title}</Text>
    </TouchableOpacity>
  );
}