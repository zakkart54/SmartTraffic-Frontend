import React from "react";
import { View, Text, Image, ImageStyle, TextStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface AppLogoProps {
  imageWidth?: number | string;
  imageMarginRight?: number;
  imageAspectRatio?: number;
  textSize?: number;
  textColor?: string;
  height?: number | 'auto' | string;
  imageProps?: ImageStyle;
  textProps?: TextStyle;
}

export default function AppLogo({
  imageWidth = "30%",
  imageMarginRight = -15,
  imageAspectRatio = 1,
  textSize = 32,
  textColor,
  imageProps,
  textProps,
  height
}: AppLogoProps) {
  const { theme } = useTheme();

  const finalTextColor = textColor
    ? textColor
    : theme === "dark"
    ? "#FFFFFF"
    : "#063970";

  return (
    <View
      className="h-16 flex-row items-center justify-center"
      style={[{ height: height as any }]}
    >
      <Image
        source={require("../asset/logo1.png")}
        resizeMode="contain"
        style={{
          width: imageWidth,
          height: undefined,
          marginRight: imageMarginRight,
          aspectRatio: imageAspectRatio,
          ...imageProps
        } as ImageStyle}
      />
      <Text
        style={{ 
          fontSize: textSize,
          color: finalTextColor,
          ...textProps
        } as TextStyle}
        className="font-bold"
      >
        SmartTraffic
      </Text>
    </View>
  );
}