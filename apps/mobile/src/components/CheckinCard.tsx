import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCheckin } from '../contexts/checkin-context';

export default function CheckinCard() {
    const theme = useTheme();
    const { isCheckedIn, checkInTime, checkIn, checkOut, isLoading } = useCheckin();
    const [timeElapsed, setTimeElapsed] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isCheckedIn && checkInTime) {
            const updateTimer = () => {
                const now = new Date();
                const diffMs = now.getTime() - checkInTime.getTime();

                const totalSeconds = Math.floor(diffMs / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;

                setTimeElapsed({ hours, minutes, seconds });
            };

            updateTimer(); // Initial call
            interval = setInterval(updateTimer, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isCheckedIn, checkInTime]);

    const padZero = (num: number) => num.toString().padStart(2, '0');

    if (isLoading) {
        return (
            <Surface style={styles.card} elevation={1}>
                <View style={[styles.iconContainer, { marginVertical: 40 }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
                <Text style={styles.title}>Carregando...</Text>
                <Text style={styles.subtitle}>
                    Verificando seu status de check-in.
                </Text>
            </Surface>
        );
    }

    if (!isCheckedIn) {
        // Inactive State Card
        return (
            <Surface style={styles.card} elevation={1}>
                <View style={styles.iconContainer}>
                    <View style={styles.qrBackground}>
                        <MaterialCommunityIcons name="qrcode-scan" size={40} color={theme.colors.primary} />
                    </View>
                </View>

                <Text style={styles.title}>Acesso ao Hub</Text>
                <Text style={styles.subtitle}>
                    Aproxime este código da catraca ou mostre na recepção.
                </Text>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={checkIn}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="qrcode-scan" size={20} color="#FFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Fazer Check-in</Text>
                </TouchableOpacity>
            </Surface>
        );
    }

    // Active State Card
    return (
        <Surface style={styles.card} elevation={1}>
            <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                    <View style={styles.badgeDot} />
                    <Text style={styles.badgeText}>Check-in Ativo</Text>
                </View>
            </View>

            <Text style={styles.activeTitle}>Você está no Locomotiva Hub</Text>

            <View style={styles.locationContainer}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#475569" />
                <Text style={styles.locationText}>Coworking Open Space</Text>
            </View>

            <View style={styles.timerContainer}>
                <View style={styles.timeBlockContainer}>
                    <View style={styles.timeBlock}>
                        <Text style={styles.timeValue}>{padZero(timeElapsed.hours)}</Text>
                    </View>
                    <Text style={styles.timeLabel}>HORAS</Text>
                </View>

                <View style={styles.colonContainer}>
                    <Text style={styles.colon}>:</Text>
                </View>

                <View style={styles.timeBlockContainer}>
                    <View style={styles.timeBlock}>
                        <Text style={styles.timeValue}>{padZero(timeElapsed.minutes)}</Text>
                    </View>
                    <Text style={styles.timeLabel}>MIN</Text>
                </View>

                <View style={styles.colonContainer}>
                    <Text style={styles.colon}>:</Text>
                </View>

                <View style={styles.timeBlockContainer}>
                    <View style={styles.timeBlock}>
                        <Text style={[styles.timeValue, { color: theme.colors.primary }]}>{padZero(timeElapsed.seconds)}</Text>
                    </View>
                    <Text style={styles.timeLabel}>SEG</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.outlineButton}
                onPress={checkOut}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="logout-variant" size={20} color="#1E293B" style={styles.buttonIcon} />
                <Text style={styles.outlineButtonText}>Fazer Checkout</Text>
            </TouchableOpacity>
        </Surface>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    qrBackground: {
        backgroundColor: '#E0F2FE', // Light blue background for the icon
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 10,
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Active State Styles
    badgeContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7', // Light green
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    badgeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22C55E', // Green
        marginRight: 6,
    },
    badgeText: {
        color: '#166534',
        fontSize: 12,
        fontWeight: '700',
    },
    activeTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 8,
        textAlign: 'center',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    locationText: {
        color: '#475569',
        fontSize: 14,
        marginLeft: 4,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        width: '100%',
    },
    timeBlockContainer: {
        alignItems: 'center',
    },
    timeBlock: {
        backgroundColor: '#F1F5F9', // Light gray background
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
    },
    timeLabel: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    colonContainer: {
        paddingHorizontal: 8,
        paddingBottom: 24, // Align with the time blocks
    },
    colon: {
        fontSize: 24,
        fontWeight: '700',
        color: '#CBD5E1',
    },
    outlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    outlineButtonText: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: '600',
    },
});
