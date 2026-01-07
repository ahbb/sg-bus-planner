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

export default function AddDestination() {
  const [destinationName, setDestinationName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

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
  const toggleStop = (code: string) => {
    setSelectedCodes(
      (prev) =>
        // check whether code is already selected
        // true: remove it from selection
        // false: add it to selection
        prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
      // filter creates a new array, and keeps only elements that are not equal to code
      // ...prev “spreads” all elements of the array into a new array, and then append bus stop code into it
    );
    setSearchQuery("");
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

        {/* Display selected bus stops */}
        {selectedCodes.length > 0 && (
          <>
            <Text style={styles.label}>Selected bus stops:</Text>

            {selectedCodes.map((code) => {
              const stop = BUS_STOP_MAP[code];
              if (!stop) return null;

              return (
                <Pressable
                  key={code}
                  onPress={() =>
                    router.push({
                      pathname: "/screens/addDestination",
                    })
                  }
                >

                  <Text key={code} style={styles.selectedText}>
                    • {stop.BusStopCode} - {stop.Description}
                  </Text>
                  
                </Pressable>
              );
            })}
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}
