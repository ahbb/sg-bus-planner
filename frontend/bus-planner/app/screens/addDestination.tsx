import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Pressable,
  FlatList,
} from "react-native";
import { useState } from "react";
import ScreenWrapper from "./screenwrapper";
import busStops from "../data/bus_stops_241225.json";
import { styles } from "./addDestinationStyles";
import { BusStop, BUS_STOP_MAP } from "../data/busStops";
import { router } from "expo-router";
import { BACKEND_URL, BACKEND_URL_LIVE } from "../config/url";
import { StopServicesMap } from "../model/saved_destination";

export default function AddDestination() {
  const [destinationName, setDestinationName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [stopServices, setStopServices] = useState<StopServicesMap>({});
  const [loadingStops, setLoadingStops] = useState<Set<string>>(new Set());

  // get bus services number based on bus stop code
  const fetchBusServices = async (busStopCode: string) => {
    const params = {
      "bus_stop_code": busStopCode
    }
    const urlParams = new URLSearchParams(params);

    try {
      const res = await fetch(`${BACKEND_URL}/bus-services?${urlParams.toString()}`, {
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

  /** SEARCH: array-based */
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

      // removes the stop from the loading Set after the API call completes
      setLoadingStops((prev) => {
        const copy = new Set(prev);
        copy.delete(code);
        return copy;
      });
    }

    setSearchQuery(""); // hide flatlist after selection
  };

  const isSelected = (code: string) => selectedCodes.includes(code);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Destination name */}
        <Text style={styles.label}>Your destination:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Work, School"
          value={destinationName}
          onChangeText={setDestinationName}
        />

        {/* Search */}
        <Text style={styles.label}>Add bus stops:</Text>
        <TextInput
          style={styles.input}
          placeholder="Bus stop code or location"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Search results */}
        {searchQuery.length > 0 && (
          <FlatList
            data={filteredStops.slice(0, 30)}
            keyExtractor={(item) => item.BusStopCode}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => toggleStop(item.BusStopCode)}
                style={[
                  styles.stopItem,
                  isSelected(item.BusStopCode) && styles.selected,
                ]}
              >
                <Text style={styles.stopTitle}>
                  {item.BusStopCode} — {item.Description}
                </Text>
                <Text style={styles.stopSubtitle}>{item.RoadName}</Text>
              </Pressable>
            )}
          />
        )}

        {/* Display selected bus stops and respective bus service numbers */}
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

              {services && services.length > 0 && (
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontWeight: "bold" }}>Available buses:</Text>
                  {services.map((svc) => (
                    <Text key={svc}>- {svc}</Text>
                  ))}
                </View>
              )}

              {services && services.length === 0 && (
                <Text style={{ marginLeft: 10 }}>No services found</Text>
              )}
            </View>
          );
        })}

      </View>
    </ScreenWrapper>
  );
}
