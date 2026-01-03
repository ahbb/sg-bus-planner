import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // <--- hides all headers
        contentStyle: { paddingTop: 40 }, // add standard top padding for all screens
      }}
    />
  );
}
