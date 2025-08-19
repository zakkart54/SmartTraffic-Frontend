import React, { useState, useRef } from "react";
import { View, ImageBackground, TouchableOpacity, Text } from "react-native";
import MapView, { Polyline, Region, Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { useTheme } from '@/hooks/useTheme';

const INITIAL_REGION: Region = {
  latitude: 10.82,
  longitude: 106.63,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function MapPage() {
  const mapRef = useRef(null);

  const { theme } = useTheme();

  const geojson = require("../data/points.json");

  const lines = geojson.features.filter((f: any) => f.geometry.type === "LineString").map((f: any) => f.geometry.coordinates);

  // const getMapCorners = async () => {
  //   if (mapRef.current) {
  //     try {
  //       const boundaries = await mapRef.current.getMapBoundaries();
  //       console.log('NorthEast:', boundaries.northEast);
  //       console.log('SouthWest:', boundaries.southWest);
  //     } catch (err) {
  //       console.log('Error getting boundaries:', err);
  //     }
  //   }
  // };

  const handleMapChangeComplete = async () => {
    if (mapRef.current) {
      const boundaries = await mapRef.current.getMapBoundaries();
      const ne = boundaries.northEast;
      const sw = boundaries.southWest;

      const corner1: [number, number] = [ne.latitude, ne.longitude];
      const corner2: [number, number] = [sw.latitude, sw.longitude];

      //call api
    }
  };

  return (
    <ImageBackground
      source={
        theme === "dark"
          ? require("@/asset/background.png")
          : require("@/asset/background1.png")
      }
      resizeMode="cover"
      style={{ flex: 1, width: "100%", height: "100%" }}
    >
      <Header userName="User" hideMenu={true}/>

      <View style={{ flex: 1, margin: 16, borderRadius: 16, overflow: "hidden" }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={INITIAL_REGION}
          zoomEnabled
          zoomControlEnabled
          scrollEnabled
          pitchEnabled
          maxZoomLevel={20}
          showsUserLocation
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          onRegionChangeComplete={handleMapChangeComplete}
        >
          {lines.map((coords, idx) => {
            const formattedCoords = coords.map(([lon, lat]: [number, number]) => ({
              latitude: lat,
              longitude: lon,
            }));
            // const midPoint = formattedCoords[Math.floor(formattedCoords.length / 2)];
            return (
              <React.Fragment key={idx}>
                <Polyline coordinates={formattedCoords} strokeColor="#FF0000" strokeWidth={3} />
                {/* <Marker coordinate={midPoint}>
                  <Callout tooltip>
                    <View style={{ backgroundColor: '#fff', padding: 8, borderRadius: 8 }}>
                      <Text style={{ fontWeight: 'bold' }}>Tuyến ABC</Text>
                      <Text>Chiều dài: 1.2km</Text>
                    </View>
                  </Callout>
                </Marker> */}
              </React.Fragment>
            );
          })}
        </MapView>
      </View>

      <NavigationBar />
    </ImageBackground>
  );
}