import { View, Text, Button, ScrollView, Pressable, StyleSheet, FlatList, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import ScreenWrapper from "./screens/screenwrapper";
import { useCallback, useEffect, useState } from "react";
import { SavedDestination } from "./model/saved_destination";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./constants/storageKeys";
import { AppButton } from "./screens/appButton";
import { FAB } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trash2 } from "lucide-react-native";

// npx expo-doctor (check for any project issues)
// npx expo start --tunnel (tunnel to make it work on mobile)
// eas update --channel production (to view changes on built app)
// eas build -p android --profile production (to rebuild when there are native runtime changes such as in app.json)

export default function Home() {
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);

  // Default harcoded destinations
  const destinations = [
    { id: "1", label: "Home to Ang Mo Kio Int", value: "Home to Ang Mo Kio Int" },
    { id: "2", label: "Home to Hougang Int", value: "Home to Hougang Int" },
    { id: "3", label: "Home to Kembangan Stn", value: "Home to Kembangan Stn" },
    { id: "4", label: "Home to Serangoon Stn", value: "Home to Serangoon Stn" },
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

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete destination",
      "Are you sure you want to delete this destination?",
      [
        {
          text: "Cancel",
          style: "cancel" // dismisses dialog with no action
        },
        {
          text: "Delete",
          style: "destructive", // renders red delete button
          onPress: async() => {
            try {
              const saved = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_DESTINATIONS);
              const existing: SavedDestination[] = saved ? JSON.parse(saved) : []; // if saved has data, parse the JSON back into an array of SavedDestination objects. if null, default to empty array

              const updated = existing.filter((dest) => dest.id !== id); // remove destination based on id
              
              // write the rest back to asyncstorage
              await AsyncStorage.setItem(
                STORAGE_KEYS.SAVED_DESTINATIONS,
                JSON.stringify(updated)
              );

              // refresh UI
              setSavedDestinations(updated);
            }
            catch(err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete destination.");
            }
          }
        },
      ]
    );
  }

  return (
    <ScreenWrapper>
      <FlatList
        data={combinedData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.rowContainer}>
            <Pressable
              onPress={() => {
                if (item.type === "preset" && "value" in item) {
                  router.push({
                    // Hardcorded destinations
                    pathname: "/screens/results",
                    params: { destination: item.value },
                  });
                } else {
                  // Dynamically added destinations
                  router.push({
                    pathname: "/screens/results",
                    params: { destinationId: item.id },
                  });
                }
              }}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <Text style={styles.rowText}>{item.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            {item.type !== "preset" && (
              // Pressable passes a pressed boolean into the style function automatically
              <Pressable
                onPress={() => handleDelete(item.id)}
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.deleteButtonPressed, // if pressed = true, apply deleteButtonPressed style
                ]}
              >
                <Trash2 size={18} color="#FF3B30" />
              </Pressable>
            )}

          </View>
        )}
      />

      {/* Add destination button */}
      <SafeAreaView>
        <FAB
          title="Add"
          placement="right"
          upperCase={true}
          color="#2563eb"
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/screens/addDestination",
            })
          }
        ></FAB>
      </SafeAreaView>
    </ScreenWrapper>
  );
}


const styles = StyleSheet.create({
    list: {
        paddingVertical: 8
    },
    row: {
      flex: 1, // fills remaining space inside card
      paddingVertical: 16,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rowPressed: {
        opacity: 0.7
    },
    rowText: {
        fontSize: 16,
        fontWeight: "500"
    },
    chevron: {
        fontSize: 20,
        color: "#9ca3af"
    },
    separator: {
        height: 12
    },
    button: {
      paddingBottom: 20
    },
    rowContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ffffff",
      borderRadius: 12,
      elevation: 1,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      paddingRight: 8, // gives delete icon some breathing room
    },
    deleteButton: {
      padding: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    deleteButtonPressed: {
      opacity: 0.5,
    },
    deleteButtonText: {
      fontSize: 13,
      fontWeight: "600",
    },
});