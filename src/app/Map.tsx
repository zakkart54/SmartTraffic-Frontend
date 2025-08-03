import React, { useState } from "react";
import { View, ImageBackground, TouchableOpacity, Text } from "react-native";
import MapView, { Polyline, Region } from "react-native-maps";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";

let lines: any[] = [];
try {
  const geojson = require("../data/points.json");
  lines = geojson.features.filter((f: any) => f.geometry.type === "LineString");
} catch (e) {
  console.warn("Không thể tải geojson:", e);
}

const polylines = lines.map((ln: any) =>
  ln.geometry.coordinates.map(([lon, lat]: number[]) => ({ latitude: lat, longitude: lon }))
);

const INITIAL_REGION: Region = {
  latitude: 10.82,
  longitude: 106.63,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function MapPage() {
//   const [region, setRegion] = useState<Region>(INITIAL_REGION);

//   const zoom = (factor: number) => {
//     setRegion((prev) => ({
//       ...prev,
//       latitudeDelta: prev.latitudeDelta * factor,
//       longitudeDelta: prev.longitudeDelta * factor,
//     }));
//   };

  return (
    <ImageBackground
      source={require("@/asset/background.png")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <Header userName="User" />

      <View style={{ flex: 1, margin: 16, borderRadius: 16, overflow: "hidden" }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={INITIAL_REGION}
          zoomEnabled 
          zoomControlEnabled={true}
          scrollEnabled
          pitchEnabled
          showsUserLocation
        >
          {polylines.map((coords, idx) => (
            <Polyline key={idx} coordinates={coords} strokeColor="#FF0000" strokeWidth={3} />
          ))}
        </MapView>
      </View>

      <NavigationBar />
    </ImageBackground>
  );
}