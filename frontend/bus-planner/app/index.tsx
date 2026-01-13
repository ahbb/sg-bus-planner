import { View, Text, Button, ScrollView, Pressable, StyleSheet, FlatList } from "react-native";
import { router, useFocusEffect } from "expo-router";
import ScreenWrapper from "./screens/screenwrapper";
import { useCallback, useEffect, useState } from "react";
import { SavedDestination } from "./model/saved_destination";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./constants/storageKeys";
import { AppButton } from "./screens/appButton";
import { FAB } from "react-native-elements";

// npx expo start --tunnel (tunnel to make it work on mobile)
// eas update --channel production (to view changes on built app)

export default function Home() {
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);

  // Default harcoded destinations
  const destinations = [
    { id: "1", label: "Home to Ang Mo Kio Int", value: "Ang Mo Kio Int" },
    { id: "2", label: "Home to Hougang Int", value: "Hougang Int" },
    { id: "3", label: "Home to Kembangan Stn", value: "Kembangan Stn" },
    { id: "4", label: "Home to Serangoon Stn", value: "Serangoon Stn" },
  ];

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

  const combinedData = [
    ...destinations.map((d) => ({
        id: d.id,
        label: d.label,
        type: "preset",
        value: d.value,
    })),
    ...savedDestinations.map((d) => ({
        id: d.id,
        label: d.name,
        type: "saved",
        destinationId: d.id,
    })),
];

  const clearAllDestinations = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_DESTINATIONS);
    setSavedDestinations([]);
  };


  return (
    <ScreenWrapper>
      <FlatList
        data={combinedData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (item.type === "preset" && "value" in item) {
                router.push({
                  pathname: "/screens/results",
                  params: { destination: item.value },
                });
              } else {
                router.push({
                  pathname: "/screens/results",
                  params: { destinationId: item.id },
                });
              }
            }}
            style={({ pressed }) => [
              styles.row,
              pressed && styles.rowPressed,
            ]}
          >
            <Text style={styles.rowText}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />

      {/* Temporary delete storage button */}
      {/* <AppButton title="Delete storage (dev)" onPress={clearAllDestinations} /> */}
      
      {/* Add destination button */}
      <FAB title="Add" placement="right" upperCase={true} color="#2563eb" onPress={() =>
          router.push({
            pathname: "/screens/addDestination",
          })}>

      </FAB>

    </ScreenWrapper>
  );
}


const styles = StyleSheet.create({
    list: {
        paddingVertical: 8,
    },
    row: {
        backgroundColor: "#ffffff",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 1, // Android
        shadowColor: "#000", // iOS
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    rowPressed: {
        opacity: 0.7,
    },
    rowText: {
        fontSize: 16,
        fontWeight: "500",
    },
    chevron: {
        fontSize: 20,
        color: "#9ca3af",
    },
    separator: {
        height: 12,
    },
});