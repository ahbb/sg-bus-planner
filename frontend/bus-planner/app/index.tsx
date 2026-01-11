import { View, Text, Button, ScrollView, Pressable } from "react-native";
import { router, useFocusEffect } from "expo-router";
import ScreenWrapper from "./screens/screenwrapper";
import { useCallback, useEffect, useState } from "react";
import { SavedDestination } from "./model/saved_destination";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./constants/storageKeys";

// npx expo start --tunnel (tunnel to make it work on mobile)
// eas update --channel production (to view changes on built app)

export default function Home() {
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);

  // Load saved destinations from async storage
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_DESTINATIONS);
          setSavedDestinations(raw ? JSON.parse(raw) : []);
        } catch (err) {
          console.error("Failed to load destinations", err);
        }
      };

      load();
    }, [])
  );

  const clearAllDestinations = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_DESTINATIONS);
    setSavedDestinations([]);
  };


  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          flexGrow: 1,
        }}
      >
        <Text style={{ fontSize: 20, marginBottom: 20, textAlign: "center" }}>
          Where are you going?
        </Text>

        <Button
          title="Home to Ang Mo Kio Int"
          onPress={() =>
            router.push({
              pathname: "/screens/results",
              params: { destination: "Ang Mo Kio Int" },
            })
          }
        />

        <View style={{ marginTop: 12 }} />

        <Button
          title="Home to Hougang Int"
          onPress={() =>
            router.push({
              pathname: "/screens/results",
              params: { destination: "Hougang Int" },
            })
          }
        />

        <View style={{ marginTop: 12 }} />

        <Button
          title="Home to Kembangan Stn"
          onPress={() =>
            router.push({
              pathname: "/screens/results",
              params: { destination: "Kembangan Stn" },
            })
          }
        />

        <View style={{ marginTop: 12 }} />

        <Button
          title="Home to Serangoon Stn"
          onPress={() =>
            router.push({
              pathname: "/screens/results",
              params: { destination: "Serangoon Stn" },
            })
          }
        />

        {/* Load saved destinations from storage */}
        {/* TODO: make it correct format such that it will be able to call compare api successfully */}
        {savedDestinations.length > 0 && (
          <>
            {savedDestinations.map((dest) => (
              <View key={dest.id}
                style={{ marginTop: 12 }}>
                <Button
                  title={dest.name}
                />
              </View>
            ))}
          </>
        )}

        <View style={{ marginTop: 48 }} />

        {/* Add destination button */}
        <Button
          title="Add Destination"
          onPress={() =>
            router.push({
              pathname: "/screens/addDestination",
            })
          }
        />

        <View style={{ marginTop: 48 }} />
        
        {/* Temporary delete storage button */}
        <Button
          title="Delete storage (dev)"
          onPress={clearAllDestinations}
        />

      </ScrollView>
    </ScreenWrapper>
  );
}
