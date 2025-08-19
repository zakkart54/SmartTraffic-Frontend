import 'dotenv/config';

export default {
  expo: {
    scheme: "acme",
    userInterfaceStyle: "automatic",
    orientation: "default",
    web: {
      output: "static",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-audio",
        {
          microphonePermission: "Cho phép ứng dụng sử dụng micro để ghi âm",
        },
      ],
    ],
    name: "app",
    slug: "app",
    extra: {
      EXPO_PUBLIC_API_URL: "http://10.0.2.2:5000",
      // GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    },
    updates: {
      enabled: false,
    },
    android: {
      package: "com.smarttraffic.app",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
};
