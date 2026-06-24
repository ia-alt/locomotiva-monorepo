import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { usePrivateStackNavigation } from '../../../navigation/PrivateNavigator';
import RoomSelector from '../../../components/RoomSelector';
import { PrimaryButton } from '../../../design/components';
import { colors, spacing, radius, typography } from '../../../design/tokens';
import { ORPCOutputs } from '../../../locomotiva-api/types';

type RoomFromList = ORPCOutputs["booking"]["listRooms"][0]

export default function CriarReservaScreen() {
    const navigation = usePrivateStackNavigation();

    const [selectedRoom, setSelectedRoom] = useState<RoomFromList | null>(null)

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.stepIndicator}>
                <View style={styles.stepActive}><Text style={styles.stepTextActive}>1</Text></View>
                <View style={styles.stepLine} />
                <View style={styles.stepInactive}><Text style={styles.stepTextInactive}>2</Text></View>
                <View style={styles.stepLine} />
                <View style={styles.stepInactive}><Text style={styles.stepTextInactive}>3</Text></View>
            </View>

            <Text style={styles.title}>Criar reserva</Text>
            <Text style={styles.stepLabel}>Selecione a sala desejada para a reserva.</Text>

            <RoomSelector
                selectedRoom={selectedRoom}
                setSelectedRoom={setSelectedRoom}
            />

            <View style={styles.footer}>
                <PrimaryButton
                    disabled={!selectedRoom}
                    onPress={() => {
                        if (selectedRoom) {
                            navigation.navigate('DisponibilidadeReserva', { room: selectedRoom });
                        }
                    }}
                    icon="arrow-right"
                >
                    Avançar
                </PrimaryButton>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    stepActive: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.brand.navy,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepInactive: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.surface.subtle,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: colors.border.subtle,
        marginHorizontal: spacing.sm,
    },
    stepTextActive: {
        fontFamily: typography.family,
        color: colors.text.onBrand,
        fontWeight: typography.weight.bold,
        fontSize: typography.size.base,
    },
    stepTextInactive: {
        fontFamily: typography.family,
        color: colors.text.muted,
        fontWeight: typography.weight.bold,
        fontSize: typography.size.base,
    },
    title: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        fontSize: typography.size.xxl,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    stepLabel: {
        fontFamily: typography.family,
        fontSize: typography.size.md,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    footer: {
        marginTop: spacing.lg,
    },
});
