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
      EXPO_PUBLIC_API_URL: "http://10.0.117.117:5000",
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      eas: {
        projectId: "cc3638b0-6e4d-4b81-b24f-8a4c4c5e985f",
      },
    },
    updates: {
      enabled: false,
    },
    android: {
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "INTERNET"
      ],
      package: "com.smarttraffic.app",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      "notifications": {
        "icon": "./asset/icons/bell.png",
        "color": "#000000"
      }
    },
    ios: {
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        "NSLocationWhenInUseUsageDescription": "This app uses location to show your position on the map."
      }
    },
  },
};
