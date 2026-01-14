import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenWrapperProps = {
    children: React.ReactNode;
    title?: string;
};

export default function ScreenWrapper({ children, title }: ScreenWrapperProps) {
    return (
        <>
            <StatusBar backgroundColor="#0556ad" />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    {/* Custom Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{title ?? "Bus Planner 🚌"}</Text>
                    </View>

                    {/* Screen content */}
                    <View style={styles.content}>{children}</View>
                </View>
            </SafeAreaView>
        </>
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