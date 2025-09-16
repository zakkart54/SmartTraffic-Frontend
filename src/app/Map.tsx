import React, { useState, useRef, useEffect } from "react";
import { View, ImageBackground, ActivityIndicator } from "react-native";
import MapView, { Polyline, Region, Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { useTheme } from '@/hooks/useTheme';
import { useSegment } from "@/hooks/useSegment";
import Constants from "expo-constants";
import * as Location from "expo-location";
import LocationSearch from "../components/LocationSearch";

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
  const { getMapSegment, isLoading} = useSegment();
  const { theme } = useTheme();
  const [lines, setLines] = useState<any[]>([]);
  const [searchMarker, setSearchMarker] = useState<{lat: number; lng: number} | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region>(INITIAL_REGION);
  const [key, setKey] = useState(0);

  useEffect(() => {
    (async () => {
      const region = await getCurrentLocation();
      if (region) setInitialRegion(region);
    })();
  }, []);

  function getZoomLevel(region: Region, mapWidthPx: number): number {
    const angle = region.longitudeDelta;
    return Math.round(Math.log2(360 * (mapWidthPx / 256 / angle)));
  }

  // const initialRegion = getCurrentLocation()
  // ? { ...getCurrentLocation(), latitudeDelta: 0.01, longitudeDelta: 0.01 }
  // : INITIAL_REGION;
  
  // const animatedThisRender = useRef(false);
  // useEffect(() => {
  //   if (!animatedThisRender.current && mapRef.current) {
  //     animatedThisRender.current = true;
  //     mapRef.current.animateToRegion(INITIAL_REGION);
  //   }
  //   return () => {
  //     animatedThisRender.current = true;
  //   };
  // });

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

  const handleMapChangeComplete = async (region: Region) => {
    if (!mapRef.current) return;
    const zoom = getZoomLevel(region, 400);
    if (zoom < 16) {
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
        status: segment.status
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
      {/* <Header userName="User" hideMenu={true}/> */}
      <View className="mt-2 mx-2">
        <LocationSearch 
          onLocationSelect={handleLocationSelect}
          apiKey={apiKey}
        />
      </View>
      <View className="m-2 flex-1 rounded-2xl overflow-hidden">
        <MapView
          style={{ flex: 1 }}
          key={key}
          onMapReady={async () => { 
            if (mapRef.current) { 
              const region = await mapRef.current.getCamera(); 
              handleMapChangeComplete(region); 
            } 
          }}
          initialRegion={INITIAL_REGION}
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
          {lines.map((line) => (
            <Polyline
              key={line.id}
              coordinates={line.coordinates}
              strokeColor="#80FF00"
              strokeWidth={4}
            />
          ))}
          {searchMarker && (
            <Marker coordinate={{ latitude: searchMarker.lat, longitude: searchMarker.lng }} />
          )}
        </MapView>
        {isLoading && (
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: 8,
              borderRadius: 16,
            }}
          >
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </View>
      <NavigationBar />
    </ImageBackground>
  );
}

          // {/* Icon tai nạn tại điểm giữa đoạn đường */}
          // <Marker
          //   coordinate={{ latitude: 10.881, longitude: 106.81 }}
          //   title="Tai nạn"
          //   description="Có tai nạn tại đây"
          // >
          //   <Image
          //     source={require("@/asset/icons/bell.png")}
          //     style={{ width: 32, height: 32 }}
          //     resizeMode="contain"
          //   />
          // </Marker>