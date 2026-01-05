import { View, Text, Button } from "react-native";
import { router } from "expo-router";
import ScreenWrapper from "./screens/screenwrapper";
import { BACKEND_URL } from "./config/url"; 

// npx expo start --tunnel (tunnel to make it work on mobile)
// eas update --channel production

export default function Home() {
  return (
    <ScreenWrapper>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 20, textAlign: "center" }}>
          Where are you going?
        </Text>
        <Text style={{ fontSize: 20, marginBottom: 20, textAlign: "center" }}>
          Backend URL: {BACKEND_URL}
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
    </ScreenWrapper>
  );
}
