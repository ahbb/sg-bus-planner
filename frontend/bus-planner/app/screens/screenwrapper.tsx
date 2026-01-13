import { View, Text, StyleSheet, StatusBar } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenWrapperProps = {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
};

export default function ScreenWrapper({ children, title, showBack }: ScreenWrapperProps) {
    return (
        <>
        <StatusBar backgroundColor="#0556ad" barStyle="light-content"/>
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {/* Custom Header */}
                <View style={styles.header}>
                    {showBack && (
                        <Text style={styles.back} onPress={() => router.back()}>
                            ⬅
                        </Text>
                    )}
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
        height: 48,
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