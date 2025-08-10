import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface Props extends TextInputProps {
  label: string;
}

export default function TextInputField({ label, ...rest }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View className="mb-5">
      <Text
        className={`font-semibold mb-1 text-base ${
          isDark ? "text-white" : "text-black"
        }`}
      >
        {label}
      </Text>
      <TextInput
        className={`border-b py-2 text-base ${
          isDark
            ? "border-blue-400 text-white"
            : "border-blue-600 text-black"
        }`}
        placeholderTextColor={isDark ? "#9CA3AF" : "#4B5563"} // lighter gray for dark, darker gray for light
        {...rest}
      />
    </View>
  );
}