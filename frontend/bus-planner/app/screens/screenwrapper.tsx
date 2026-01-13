import { View, Text, StyleSheet, StatusBar } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenWrapperProps = {
    children: React.ReactNode;
    title?: string;
};

export default function ScreenWrapper({ children, title }: ScreenWrapperProps) {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="#0556ad" barStyle="light-content" translucent={false} />

            {/* Top inset: status bar background */}
            <SafeAreaView style={{ flex: 0, backgroundColor: "#0556ad" }} />

            {/* Main content */}
            <SafeAreaView style={{ flex: 1 }}>
                {/* Custom Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{title ?? "Bus Planner 🚌"}</Text>
                </View>

                {/* Screen content */}
                <View style={styles.content}>{children}</View>
            </SafeAreaView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 50,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        paddingLeft: 15
    },
    back: {
        position: "absolute",
        left: 15,
        color: "white",
        fontSize: 18,
    },
    title: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "left"
    },
    content: {
        flex: 1,
        padding: 20,
    },
    side: {
        width: 40,
        alignItems: "flex-start"
    }
});