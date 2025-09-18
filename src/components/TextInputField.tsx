import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Props extends TextInputProps {
  label: string;
  rightIconName?: string;
  rightIconColor?: string;
  rightIconSize?: string;
  containerStyle?: object;
}

export default function TextInputField({ label, rightIconName, rightIconSize, rightIconColor, containerStyle, editable = true, ...rest }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View className="mb-3" style={{ ...containerStyle }}>
      <Text
        className={`font-semibold mb-1 text-base ${isDark ? "text-white" : "text-black"}`}
      >
        {label}
      </Text>
      <View className="relative">
        <TextInput
          className={`border-b py-2 text-base ${
            isDark
              ? "border-blue-400"
              : "border-blue-600"
          } ${isDark ? "text-white" : "text-black"}`}
          placeholderTextColor={isDark ? "#9CA3AF" : "#4B5563"}
          editable={editable}
          {...rest}
        />
        {rightIconName && (
          <MaterialIcons
            name={rightIconName}
            size={rightIconSize ?? 20}
            color={rightIconColor || (isDark ? "#fff" : "#000")}
            style={{
              position: "absolute",
              right: 0,
              top: 10,
            }}
          />
        )}
      </View>
    </View>
  );
}
