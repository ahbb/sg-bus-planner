import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Pressable,
  FlatList,
  Button,
  Alert,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import ScreenWrapper from "./screenwrapper";
import busStops from "../data/bus_stops_241225.json";
import { styles } from "./addDestinationStyles";
import { BusStop, BUS_STOP_MAP } from "../data/busStops";
import { router } from "expo-router";
import { BACKEND_URL, BACKEND_URL_LIVE } from "../config/url";
import { SavedDestination, StopServicesMap } from "../model/saved_destination";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { AppButton } from "./appButton";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddDestination() {
  const [destinationName, setDestinationName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [stopServices, setStopServices] = useState<StopServicesMap>({});
  const [loadingStops, setLoadingStops] = useState<Set<string>>(new Set());

  // same as selectedServices = {[busStopCode: string]: string[]}
  // Keys → bus stop codes
  // Values → arrays of selected bus service numbers
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>({});

  // get bus services number based on bus stop code
  const fetchBusServices = async (busStopCode: string) => {
    const params = {
      "bus_stop_code": busStopCode
    }
    const urlParams = new URLSearchParams(params);

    try {
      const res = await fetch(`${BACKEND_URL_LIVE}/bus-services?${urlParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // for local dev
        }
      });

      if (!res.ok) return;

      const data = await res.json();
      setStopServices((prev) => ({ // prev = previous value of stopServices. same as const prev = stopServices
        ...prev, // copy all existing key-value pairs into new object
        [busStopCode]: data.services,
      }));
    } catch (err) {
      console.error("Failed to fetch bus services", err);
    }
  }

  /** Search bus stop: array-based */
  const filteredStops = busStops.filter((stop: BusStop) => {
    const q = searchQuery.toLowerCase();
    return (
      stop.BusStopCode.includes(q) ||
      stop.Description.toLowerCase().includes(q) ||
      stop.RoadName.toLowerCase().includes(q)
    );
  });

  /** Toggle selection using bus stop codes only */
  const toggleStop = async (code: string) => {
    setSelectedCodes((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
    
    // no bus services cached for the bus stop code
    if (!stopServices[code]) {
      // store bus stop codes currently loading (fetching from api)
      setLoadingStops((prev) => new Set(prev).add(code));
      await fetchBusServices(code);

      // removes the stop from the loading set after the API call completes
      setLoadingStops((prev) => {
        const copy = new Set(prev);
        copy.delete(code);
        return copy;
      });
    }

    setSearchQuery(""); // hide flatlist after selection
  };

  const isSelected = (code: string) => selectedCodes.includes(code);

  // select bus services checkbox
  const toggleService = (busStopCode: string, serviceNo: string) => {
    setSelectedServices((prev) => { // prev = previous value of the state (the entire previous selectedServices object)

      const current = prev[busStopCode] ?? []; // looks up array of services for the bus stop code. if does not exist, use an empty array
      // guarantees that current is always an array. Calling .includes() on undefined would crash.

      return {
        ...prev, // not modifying prev, instead creating a new object
        // key:value
        [busStopCode]: current.includes(serviceNo) ? current.filter((s) => s !== serviceNo) : [...current, serviceNo], // if array already includes service number, remove it. if does not include, add it (toggling logic)
      };
    });
  };

  // save button logic. validation and save to async storage
  const handleSave = async () => {
    if (!destinationName.trim()) {
      Alert.alert("Please input destination name.");
    }

    if (selectedCodes.length === 0) {
      Alert.alert("Please select at least one bus stop.");
    }

    const hasAnyService = Object.values(selectedServices).some(
      (services) => services.length > 0
    );

    if (!hasAnyService) {
      Alert.alert("Please select at least one bus service.");
      return;
    }

    // Object.values = converts the object into an array of its values
    // reduce iterates over each array and total keeps track of the number of services
    const count = Object.values(selectedServices).reduce((total, services) => total + services.length, 0); // total number of services
    if (count > 10) {
      Alert.alert("More than 10 services are not allowed.");
      return;
    }

    // Build payload
    const destinationToSave: SavedDestination = {
      id: Date.now().toString(),
      name: destinationName.trim(),
      busStops: selectedCodes.map((code) => { // map transforms each bus stop code into a full object
        const stop = BUS_STOP_MAP[code];
        const services = selectedServices[code] ?? [];

        if (!stop || services.length === 0) return null;
        
        return {
          busStopCode: stop.BusStopCode,
          description: stop.Description,
          roadName: stop.RoadName,
          services,
        };
      })
      .filter(Boolean) as SavedDestination["busStops"] // Removes all null values returned earlier and ensures busStops contains only valid objects
    };

    // Save to async storage
    // AsyncStorage cannot append data. must read existing data, modify it and then write back
    try {
      const savedDestinations = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_DESTINATIONS);
      const existing: SavedDestination[] = savedDestinations ? JSON.parse(savedDestinations) : [];

      await AsyncStorage.setItem( // persist to storage
        STORAGE_KEYS.SAVED_DESTINATIONS,
        JSON.stringify([...existing, destinationToSave]) // "..." creates a new array. appending new destination to it
      );

      Alert.alert("Saved", "Destination saved successfully.");
      router.replace("/"); // redirect back to home screen
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save destination.");
    }
  };

  // flatlist cannot be nested inside a scrollview with the same scroll direction
  return (
    <ScreenWrapper>
      <FlatList
        data={searchQuery.length > 0 ? filteredStops.slice(0, 30) : []}
        keyExtractor={(item) => item.BusStopCode}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <Text style={styles.label}>Your destination:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Work, School"
              placeholderTextColor={"#666"}
              value={destinationName}
              onChangeText={setDestinationName}
            />

            <Text style={styles.label}>Add bus stops:</Text>
            <TextInput
              style={styles.input}
              placeholder="Bus stop code or location"
              placeholderTextColor={"#666"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </>
        }
        // renderItem - tells flatlist how to render the items from data (when user searches, the suggestions come out as pressable). this will be called multiple times as user performs search
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggleStop(item.BusStopCode)}
            style={[
              styles.stopItem,
              isSelected(item.BusStopCode) && styles.selected,
            ]}
          >
            <Text style={styles.stopTitle}>
              {item.BusStopCode} - {item.Description}
            </Text>
            <Text style={styles.stopSubtitle}>{item.RoadName}</Text>
          </Pressable>
        )}
        // ListFooterComponent = content rendered once, below the flatlist
        ListFooterComponent={
          <>
            {selectedCodes.map((code) => {
              const stop = BUS_STOP_MAP[code];
              if (!stop) return null;

              const services = stopServices[code];

              return (
                <View key={code} style={{ marginBottom: 12 }}>
                  <Text style={styles.selectedText}>
                    • {stop.BusStopCode} - {stop.Description}
                  </Text>

                  {loadingStops.has(code) && (
                    <Text style={{ marginLeft: 10 }}>Loading buses…</Text>
                  )}

                  {services?.length > 0 && (
                    <View style={{ marginLeft: 12 }}>
                      <Text style={{ fontWeight: "bold", marginTop: 4 }}>
                        Select buses:
                      </Text>

                      {services.map((svc) => {
                        const selected = selectedServices[code]?.includes(svc);

                        return (
                          <Pressable
                            key={svc}
                            onPress={() => toggleService(code, svc)}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginTop: 12,
                            }}
                          >
                            <Text style={{ width: 20 }}>
                              {selected ? "☑" : "☐"}
                            </Text>
                            <Text style={{ fontSize: 14 }}>{svc}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {services?.length === 0 && (
                    <Text style={{ marginLeft: 10 }}>No services found</Text>
                  )}
                </View>
              );
            })}

            <SafeAreaView>
              <AppButton title="Save" onPress={handleSave} />
            </SafeAreaView>
          </>
        }
      />
    </ScreenWrapper>
  );

}
