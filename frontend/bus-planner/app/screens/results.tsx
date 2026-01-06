import { View, Text, ActivityIndicator, Button, ScrollView, RefreshControl } from "react-native";
import { Key, useEffect, useState } from "react";
import { compareBusArrivals } from "../services/api";
import { useLocalSearchParams, router } from "expo-router";
import { DESTINATIONS, DestinationKey } from "../config/destinations";
import { BUS_STOP_MAP } from "../data/busStops";
import ScreenWrapper from "./screenwrapper";
import { Pressable } from "react-native";

export default function Results() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const REFRESH_COOLDOWN = 30 * 1000; // 30 seconds
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const { destination } = useLocalSearchParams<{
    destination: DestinationKey;
  }>();
  const config = DESTINATIONS[destination];

  useEffect(() => {
    async function load() {
      try {
        const data = await compareBusArrivals(config.options);
        setResults(data.results);
      } catch (err) {
        setError("Failed to load bus data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [destination]);

  const onRefresh = async () => {
    const now = Date.now();
    if (now - lastRefresh < REFRESH_COOLDOWN) {
      return; // call api on refresh only every 30 seconds
    }

    setRefreshing(true);
    try {
      const data = await compareBusArrivals(config.options);
      setResults(data.results);
      setLastRefresh(now);
    } catch (err) {
      setError("Failed to refresh bus data");
    } finally {
      setRefreshing(false);
    }
  };

  if (!config) {
    return <Text style={{ padding: 20 }}>Unknown destination</Text>;
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return <Text style={{ padding: 20 }}>{error}</Text>;
  }

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={{ fontSize: 20, marginBottom: 10 }}>Best buses to:</Text>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>{destination}</Text>

        <View style={{ marginTop: 12 }} />

        {results.length === 0 ? (
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
              fontSize: 16,
              marginBottom: 40,
              color: "#666",
            }}
          >
            No buses found right now 🚫🚌
          </Text>
        ) : (
          results.map((item, index) => {
            const stop = BUS_STOP_MAP[item.bus_stop_code];
            // ensure only one item expands at a time
            const isExpanded = expandedIndex === index; // eg. index = 2, expandedIndex === index (2 === 2), isExpanded = true

            return (
              <Pressable
                onPress={() =>
                  setExpandedIndex(isExpanded ? null : index) // when item is already expanded, tapping it will set the expanded index to be null. (tapping an open item will cause it to be toggled to close) else, expand the selected unopened item, and collapse any previously expanded item
                }
                style={({ pressed }) => [
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View
                  style={{
                    padding: 12,
                    marginBottom: 25,
                    borderWidth: 1,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    {item.service_no}
                  </Text>

                  {/* Tappable ETA */}
                  <Text style={{ fontWeight: "bold", fontStyle: "italic"}}>
                    {item.next_buses[0]?.eta_min <= 0
                      ? "Arriving"
                      : `${item.next_buses[0]?.eta_min} min`}
                  </Text>

                  {/* Inline expanded timings */}
                  {isExpanded && (
                    <>
                      <Text style={{ marginTop: 6 }}>
                        Next buses in:
                      </Text>

                      {item.next_buses.slice(1).map(
                        (bus: { eta_min: number }, i: number) => (
                          <Text
                            key={i}
                            style={{ fontSize: 14, marginLeft: 10, marginTop: 4 }}
                          >
                            • {bus.eta_min <= 0 ? "Arriving" : `${bus.eta_min} min`}
                          </Text>
                        )
                      )}
                    </>
                  )}

                  <Text style={{ fontSize: 14 }}>
                    {stop?.Description ?? "Unknown stop"}
                  </Text>

                </View>
              </Pressable>
            );
          })
        )}

        {/* Back to Home button */}
        <Button title="⬅ Home" onPress={() => router.push("/")} />
      </ScrollView>
    </ScreenWrapper>
  );
}
