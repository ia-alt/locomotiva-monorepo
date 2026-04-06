import { FC } from "react";
import { StyleSheet } from "react-native";
import { ActivityIndicator, Surface, Text, useTheme } from "react-native-paper";
import { useAccessCode } from "../hooks/use-access-code";

export const CheckinQrcode: FC = () => {
    const { accessCode, error, loading } = useAccessCode();
    const theme = useTheme();

    return (
        <Surface style={styles.container} mode="flat" elevation={2}>
            {loading ? (
                <ActivityIndicator animating={true} size="large" />
            ) : error ? (
                <Text style={{ color: theme.colors.error, textAlign: 'center' }}>
                    {error}
                </Text>
            ) : (
                <Text variant="displayLarge" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {accessCode}
                </Text>
            )}
        </Surface>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 200,
        height: 200,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
    }
});