import React from "react";
import { View, Text, Image, ImageStyle, TextStyle, Dimensions } from "react-native";
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
  imageWidth = "80",
  imageMarginRight = 5,
  imageAspectRatio = 1,
  textSize = 32,
  textColor,
  imageProps,
  textProps,
  height
}: AppLogoProps) {
  const { theme } = useTheme();
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  const finalTextColor = textColor
    ? textColor
    : theme === "dark"
    ? "#FFFFFF"
    : "#063970";

    let computedHeight: number | undefined;
    if (typeof height === "string") {
      if (height === "auto") {
        computedHeight = undefined;
      } else if (height.endsWith("%")) {
        computedHeight = (parseFloat(height) / 100) * SCREEN_HEIGHT;
      } else {
        computedHeight = undefined;
      }
    } else {
      computedHeight = height;
    }
  return (
    <View
      className="flex-row items-center justify-center"
      style={{ height: computedHeight  }}
    >
      <Image
        source={require("../asset/logo1.png")}
        resizeMode="contain"
        className={`mr-${Math.abs(imageMarginRight)}`}
        style={{
          width: imageWidth,
          height: undefined,
          aspectRatio: imageAspectRatio,
          ...imageProps,
        } as ImageStyle}
      />
      <Text
        className="font-bold"
        style={{
          fontSize: textSize,
          color: finalTextColor,
          ...textProps,
        } as TextStyle}
      >
        SmartTraffic
      </Text>
    </View>
  );
}
