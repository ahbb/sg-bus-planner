import { View, Text, Button, ScrollView } from "react-native";
import { router } from "expo-router";
import ScreenWrapper from "./screens/screenwrapper";

// npx expo start --tunnel (tunnel to make it work on mobile)
// eas update --channel production (to view changes on built app)

export default function Home() {
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

        <View style={{ marginTop: 12 }} />

        <Button
          title="Kembangan Stn"
          onPress={() =>
            router.push({
              pathname: "/screens/results",
              params: { destination: "Kembangan Stn" },
            })
          }
        />

        <View style={{ marginTop: 12 }} />

        <Button
          title="Serangoon Stn"
          onPress={() =>
            router.push({
              pathname: "/screens/results",
              params: { destination: "Serangoon Stn" },
            })
          }
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
