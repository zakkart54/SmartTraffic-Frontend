import React, { useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TextInputField from "@/components/TextInputField";

const LocationSearch = ({ onLocationSelect, apiKey }) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const searchLocation = async (text) => {
    if (text.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
                  `input=${encodeURIComponent(text)}` +
                  `&language=vi&components=country:VN&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.predictions) {
        const results = data.predictions.slice(0, 5).map(item => ({
          id: item.place_id,
          name: item.description,
          place_id: item.place_id
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const selectLocation = async (result) => {
    setSearchText(result.name);
    setSearchResults([]);

    try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&key=${apiKey}&language=vi`;
        const res = await fetch(detailsUrl);
        const details = await res.json();
      
        const lat = details.result?.geometry?.location?.lat;
        const lng = details.result?.geometry?.location?.lng;
      
        if (lat && lng) {
          onLocationSelect( lat, lng );
        } else {
          console.warn("Không tìm thấy lat/lng trong place details");
        }
      } catch (err) {
        console.error('Details error:', err);
      }
  };

  return (
    <View>
      <View className="relative">
        <TextInput
          className="bg-white h-12 rounded-lg px-3 pr-10 text-lg text-neutral-600"
          placeholder="Tìm đường hoặc địa điểm..."
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            searchLocation(text);
          }}
        />
        {searchText.length == 0 && <MaterialIcons name="search" size={24} color="#9ca3af" className="absolute right-1 top-2.5"/>}
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              setSearchResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Text className="text-neutral-500 text-4xl">×</Text>
          </TouchableOpacity>
        )}
      </View>

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          className="bg-white rounded-lg mt-1 max-h-52"
          renderItem={({ item }) => (
            <TouchableOpacity
              className="px-4 py-3 border-b border-neutral-300"
              onPress={() => selectLocation(item)}
            >
              <Text className="text-lg text-neutral-800">{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default LocationSearch;
