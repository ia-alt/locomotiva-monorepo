import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';

interface TimeSelectorProps {
    startTime: Date | null;
    endTime: Date | null;
    onPressStart?: () => void;
    onPressEnd?: () => void;
}

export default function TimeSelector({ startTime, endTime, onPressStart, onPressEnd }: TimeSelectorProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Horário</Text>
            <View style={styles.row}>
                <TouchableOpacity style={styles.touchableCard} onPress={onPressStart} activeOpacity={0.7}>
                    <Surface style={[styles.timeCard, startTime ? styles.timeCardActive : {}]} elevation={0}>
                        <Text style={styles.label}>Início</Text>
                        <View style={styles.timeDisplay}>
                            <Feather name="clock" size={16} color={startTime ? "#1E88E5" : "#9CA3AF"} />
                            <Text style={[styles.timeText, !startTime && styles.placeholder]}>
                                {startTime ? format(startTime, 'HH:mm') : '--:--'}
                            </Text>
                        </View>
                    </Surface>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <Feather name="arrow-right" size={20} color="#D1D5DB" />
                </View>

                <TouchableOpacity style={styles.touchableCard} onPress={onPressEnd} activeOpacity={0.7}>
                    <Surface style={[styles.timeCard, endTime ? styles.timeCardActive : {}]} elevation={0}>
                        <Text style={styles.label}>Fim</Text>
                        <View style={styles.timeDisplay}>
                            <Feather name="clock" size={16} color={endTime ? "#1E88E5" : "#9CA3AF"} />
                            <Text style={[styles.timeText, !endTime && styles.placeholder]}>
                                {endTime ? format(endTime, 'HH:mm') : '--:--'}
                            </Text>
                        </View>
                    </Surface>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    touchableCard: {
        flex: 1,
    },
    timeCard: {
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    timeCardActive: {
        borderColor: '#93C5FD',
        backgroundColor: '#EFF6FF',
    },
    label: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '500',
    },
    timeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    placeholder: {
        color: '#9CA3AF',
    },
    divider: {
        paddingHorizontal: 12,
    }
});
