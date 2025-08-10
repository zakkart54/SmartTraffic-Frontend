import React, { useState } from "react";
import { View, ImageBackground, TouchableOpacity, Text } from "react-native";
import MapView, { Polyline, Region, Marker, Callout } from "react-native-maps";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";

const INITIAL_REGION: Region = {
  latitude: 10.82,
  longitude: 106.63,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function MapPage() {
  const geojson = require("../data/export.json");

  const lines = geojson.features.filter((f: any) => f.geometry.type === "MultiLineString");
  
  const polylines: { latitude: number; longitude: number }[][] = lines.flatMap(
    (feature: any) =>
      feature.geometry.coordinates.map((line: number[][]) =>
        line.map(([lon, lat]: number[]) => ({
          latitude: lat,
          longitude: lon,
        }))
      )
  );

  const tooltipLine = polylines[0] ?? [];
  const tooltipPoint = tooltipLine[Math.floor(tooltipLine.length / 2)];

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
          zoomControlEnabled
          scrollEnabled
          pitchEnabled
          showsUserLocation
        >
          {polylines.map((coords, idx) => {
            const midPoint = coords[Math.floor(coords.length / 2)];
            return (
              <React.Fragment key={idx}>
                <Polyline coordinates={coords} strokeColor="#FF0000" strokeWidth={3} />
                <Marker coordinate={midPoint}>
                  <Callout tooltip>
                    <View style={{ backgroundColor: '#fff', padding: 8, borderRadius: 8 }}>
                      <Text style={{ fontWeight: 'bold' }}>Tuyến ABC</Text>
                      <Text>Chiều dài: 1.2km</Text>
                    </View>
                  </Callout>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapView>
      </View>

      <NavigationBar />
    </ImageBackground>
  );
}