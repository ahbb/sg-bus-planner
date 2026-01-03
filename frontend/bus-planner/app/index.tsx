import { View, Text, Button } from "react-native";
import { router } from "expo-router";

// npx expo start --tunnel (tunnel to make it work on mobile)

export default function Home() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Where are you going?
      </Text>

      <Button
        title="Ang Mo Kio Int"
        onPress={() =>
          router.push({
            pathname: "/screens/results",
            params: { destination: "Ang Mo Kio Int" },
          })
        }
      />

      <View style={{ marginTop: 12 }} />

      <Button
        title="Hougang Int"
        onPress={() =>
          router.push({
            pathname: "/screens/results",
            params: { destination: "Hougang Int" },
          })
        }
      />

    </View>
  );
}
