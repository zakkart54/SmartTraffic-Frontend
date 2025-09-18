import React, { useState, useRef } from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Props extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label: string;
  rightIconName?: string;
  rightIconColor?: string;
  rightIconSize?: number;
  format: string; //"DD/MM/YYYY", "HH:mm", "DD/MM/YYYY HH:mm"
  value: string;
  onChangeText: (text: string) => void;
}

export default function DateTimeInputField({ 
  label, 
  rightIconName, 
  rightIconSize = 20, 
  rightIconColor, 
  editable = true,
  format,
  value,
  onChangeText,
  ...rest 
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const inputRef = useRef<TextInput>(null);

  // const createMask = (format: string): string => {
  //   return format
  //     .replace(/D/g, '9')
  //     .replace(/M/g, '9')
  //     .replace(/Y/g, '9')
  //     .replace(/H/g, '9')
  //     .replace(/m/g, '9')
  //     .replace(/s/g, '9');
  // };

  const applyFormat = (text: string, format: string): string => {
    const numbersOnly = text.replace(/\D/g, '');
    let formatted = '';
    let numberIndex = 0;

    for (let i = 0; i < format.length && numberIndex < numbersOnly.length; i++) {
      const formatChar = format[i];
      
      if (['D', 'M', 'Y', 'H', 'm', 's'].includes(formatChar)) {
        formatted += numbersOnly[numberIndex];
        numberIndex++;
      } else {
        formatted += formatChar;
      }
    }

    return formatted;
  };

  const validateDateTime = (text: string, format: string): boolean => {
    if (text.length !== format.length) return true;

    try {
      if (format.includes('DD') && format.includes('MM') && format.includes('YYYY')) {
        const dayMatch = text.match(/(\d{2})/);
        const monthMatch = text.match(/\d{2}\/(\d{2})/);
        const yearMatch = text.match(/\d{2}\/\d{2}\/(\d{4})/);

        if (dayMatch && monthMatch && yearMatch) {
          const day = parseInt(dayMatch[1]);
          const month = parseInt(monthMatch[1]);
          const year = parseInt(yearMatch[1]);

          const date = new Date(year, month - 1, day);
          return date.getDate() === day && 
                 date.getMonth() === month - 1 && 
                 date.getFullYear() === year;
        }
      }

      if (format.includes('HH') && format.includes('mm')) {
        const hourMatch = text.match(/(\d{2})/);
        const minuteMatch = text.match(/\d{2}:(\d{2})/);

        if (hourMatch && minuteMatch) {
          const hour = parseInt(hourMatch[1]);
          const minute = parseInt(minuteMatch[1]);

          return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
        }
      }

      return true;
    } catch {
      return false;
    }
  };

  const handleChangeText = (text: string) => {
    const formatted = applyFormat(text, format);
    
    const isValid = validateDateTime(formatted, format);
    
    if (isValid) {
      onChangeText(formatted);
    }
  };

  const placeholder = format.toLowerCase();

  return (
    <View className="mb-5">
      <Text
        className={`font-semibold mb-1 text-base ${isDark ? "text-white" : "text-black"}`}
      >
        {label}
      </Text>
      <View className="relative">
        <TextInput
          ref={inputRef}
          className={`border-b py-2 text-base ${
            isDark
              ? "border-blue-400"
              : "border-blue-600"
          } ${isDark ? "text-white" : "text-black"}`}
          placeholderTextColor={isDark ? "#9CA3AF" : "#4B5563"}
          placeholder={placeholder}
          value={value}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          maxLength={format.length}
          editable={editable}
          {...rest}
        />
        {rightIconName && (
          <MaterialIcons
            name={rightIconName}
            size={rightIconSize}
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