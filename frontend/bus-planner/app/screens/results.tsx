import { View, Text, ActivityIndicator, Button } from "react-native";
import { useEffect, useState } from "react";
import { compareBusArrivals } from "../services/api";
import { useLocalSearchParams, router } from "expo-router";
import { DESTINATIONS, DestinationKey } from "../config/destinations";
import { BUS_STOP_MAP } from "../data/busStops";
import ScreenWrapper from "./screenwrapper";

export default function Results() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { destination } = useLocalSearchParams<{ destination: DestinationKey }>();
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

  if (!config) {
    return <Text style={{ padding: 20 }}>Unknown destination</Text>;
  }

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );

  }

  if (error) {
    return <Text style={{ padding: 20 }}>{error}</Text>;
  }

  return (
    <ScreenWrapper>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 10 }}>
          Best buses to:
        </Text>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          {destination}
        </Text>

        <View style={{ marginTop: 12 }} />

        {results.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 40, fontSize: 16, marginBottom: 40 }}>
            No buses found at this moment!
          </Text>
        ) : (
          results.map((item, index) => {
            const stop = BUS_STOP_MAP[item.bus_stop_code];
            return (
              <View
                key={index}
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

                <Text style={{ fontSize: 16 }}>
                  {item.eta_min === 0 ? "Arriving" : `${item.eta_min} min`}
                </Text>

                <Text style={{ fontSize: 14 }}>
                  {stop?.Description ?? "Unknown stop"}
                </Text>
              </View>
            );
          })
        )}

        {/* Back to Home button */}
        <Button
          title="⬅ Home"
          onPress={() => router.push("/")}
        />
      </View>
    </ScreenWrapper>
  );
}
