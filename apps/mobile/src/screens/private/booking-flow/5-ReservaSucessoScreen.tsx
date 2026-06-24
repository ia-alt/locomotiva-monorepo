import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton } from '../../../design/components';
import { colors, spacing, radius, typography } from '../../../design/tokens';

type ReservaSucessoNavigationProp = NativeStackNavigationProp<PrivateStackParamList, 'ReservaSucesso'>;

export default function ReservaSucessoScreen() {
    const navigation = useNavigation<ReservaSucessoNavigationProp>();

    const handleGoToReservations = () => {
        // Reset navigation to the main drawer and specific tab if possible
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'Drawer',
                    state: {
                        routes: [
                            {
                                name: 'Menu principal',
                                state: {
                                    routes: [{ name: 'Reservas' }]
                                }
                            }
                        ]
                    }
                } as any
            ],
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Feather name="check" size={56} color={colors.feedback.success} />
                </View>
                <Text style={styles.title}>Solicitação Recebida com Sucesso!</Text>
                <Text style={styles.subtitle}>
                    Enviamos sua solicitação para nossa equipe. Você receberá uma confirmação em breve. Enquanto isso, acompanhe o status em 'Minhas Reservas'.
                </Text>
            </View>

            <PrimaryButton onPress={handleGoToReservations} icon="arrow-right">
                Ir para minhas reservas
            </PrimaryButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface.background,
        padding: spacing.lg,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: radius.full,
        backgroundColor: colors.brand.light,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontFamily: typography.family,
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: typography.family,
        fontSize: typography.size.md,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: spacing.base,
    },
});
