import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, ImageBackground, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import MapView, { Polyline, Region, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import NavigationBar from "../components/NavigationBar";
import { useTheme } from '@/hooks/useTheme';
import { useSegment } from "@/hooks/useSegment";
import Constants from "expo-constants";
import * as Location from "expo-location";
import LocationSearch from "../components/LocationSearch";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const INITIAL_REGION: Region = {
  latitude: 10.880149,
  longitude: 106.805770,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const apiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;

async function getCurrentLocation(): Promise<Region | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("Quyền truy cập vị trí bị từ chối");
    return null;
  }
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
}

export default function MapPage() {
  const mapRef = useRef(null);
  const { getMapSegment, isLoading } = useSegment();
  const { theme } = useTheme();
  const [lines, setLines] = useState<any[]>([]);
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region>(INITIAL_REGION);
  const [key, setKey] = useState(0);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    (async () => {
      const region = await getCurrentLocation();
      if (region) setInitialRegion(region);
    })();
  }, []);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, []);

  function getZoomLevel(region: Region, mapWidthPx: number): number {
    const angle = region.longitudeDelta;
    return Math.round(Math.log2(360 * (mapWidthPx / 256 / angle)));
  }

  const handleLocationSelect = (lat, lng) => {
    setSearchMarker({ lat, lng });
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const getMidpoint = (coordinates) => {
    if (coordinates.length === 2) {
      const [start, end] = coordinates;
      return {
        latitude: (start.latitude + end.latitude) / 2,
        longitude: (start.longitude + end.longitude) / 2,
      };
    }
    return coordinates[Math.floor(coordinates.length / 2)];
  };
  

  const handleMapChangeComplete = async (region: Region) => {
    if (!mapRef.current) return;
    const zoom = getZoomLevel(region, 400);
    if (zoom && zoom < 16) {
      setLines([]);
      return;
    }
    const boundaries = await mapRef.current.getMapBoundaries();
    const ne = boundaries.northEast;
    const sw = boundaries.southWest;
    const bbox = {
      lon_min: sw.longitude,
      lat_min: sw.latitude,
      lon_max: ne.longitude,
      lat_max: ne.latitude,
    };
    try {
      const res = await getMapSegment(bbox);
      const polylines = res.data.map(segment => ({
        id: segment.id,
        coordinates: segment.coordinates.map(([lon, lat]) => ({ latitude: lat, longitude: lon })),
        status: segment.status,
      }));
      setLines(polylines);
    } catch (err) {
      console.error("Error fetching segments:", err);
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
      <View className="mt-4 mx-2">
        <LocationSearch onLocationSelect={handleLocationSelect} apiKey={apiKey} />
      </View>

      <View className="m-2 flex-1 rounded-2xl overflow-hidden">
        <MapView
          style={{ flex: 1 }}
          key={key}
          initialRegion={initialRegion}
          zoomEnabled
          zoomControlEnabled
          scrollEnabled
          pitchEnabled
          showsUserLocation
          ref={mapRef}
          loadingEnabled={isLoading}
          provider={PROVIDER_GOOGLE}
          onRegionChangeComplete={handleMapChangeComplete}
        >
          {lines.map(line => {
            const hasStatus =
              line.status?.JAM || line.status?.FLOOD || line.status?.POLICE || line.status?.OBSTACLE;
            return (
              <React.Fragment key={line.id}>
                <Polyline
                  coordinates={line.coordinates}
                  strokeColor={hasStatus ? "red" : "#80FF00"}
                  strokeWidth={4}
                />
                {hasStatus && (
                  <Marker coordinate={getMidpoint(line.coordinates)} anchor={{ x: 0.5, y: 0.5 }}>
                    <View className="flex-col items-center px-1.5 py-0.5 rounded-md space-x-1">
                      {line.status.JAM && <Icon name="car-brake-alert" size={20} color="red" />}
                      {line.status.FLOOD && <Icon name="waves" size={20} color="blue" />}
                      {line.status.POLICE && <Icon name="police-badge" size={20} color="green" />}
                      {line.status.OBSTACLE && <Icon name="alert-octagon" size={20} color="orange" />}
                    </View>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}
          {searchMarker && (
            <Marker coordinate={{ latitude: searchMarker.lat, longitude: searchMarker.lng }} />
          )}
        </MapView>
        {isLoading && (
          <View
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: 8,
              borderRadius: 16,
            }}
          >
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}

        <TouchableOpacity
          onPress={() => setShowLegend(!showLegend)}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            width: 40,
            height: 40,
            backgroundColor: "rgba(255,255,255,0.7)",
            justifyContent: "center",
            alignItems: "center",
            elevation: 0.5,
            shadowColor: "#000",
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 1,
            borderWidth: 0.5,
            borderColor: "#ccc",
          }}
        >
          <Icon name="information-outline" size={22} color="#333" />
        </TouchableOpacity>

        {showLegend && (
          <View
            style={{
              position: "absolute",
              top: 60,
              left: 8,
              backgroundColor: "rgba(255,255,255,0.7)",
              padding: 10,
              borderRadius: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Icon name="car-brake-alert" size={20} color="red" />
              <Text style={{ marginLeft: 6 }}>Kẹt xe</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Icon name="waves" size={20} color="blue" />
              <Text style={{ marginLeft: 6 }}>Lũ lụt</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Icon name="police-badge" size={20} color="green" />
              <Text style={{ marginLeft: 6 }}>Cảnh sát</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name="alert-octagon" size={20} color="orange" />
              <Text style={{ marginLeft: 6 }}>Có vật cản</Text>
            </View>
          </View>
        )}
      </View>
      <NavigationBar />
    </ImageBackground>
  );
}