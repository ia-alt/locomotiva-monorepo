import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { CheckinCard } from '../../components/CheckinCard';
import { CheckinProvider } from '../../contexts/checkin-context';
import { useAuth } from '../../contexts/auth-context';
import { colors, spacing, typography } from '../../design/tokens';

type InicioScreenRouteProp = RouteProp<{ Início: { code?: string } }, 'Início'>;

export default function InicioScreen() {
    const { authUser } = useAuth();
    const route = useRoute<InicioScreenRouteProp>();
    const navigation = useNavigation<any>();

    const rawCode = route.params?.code;
    const cleanCode = rawCode ? rawCode.replace(/['"]/g, '') : undefined;

    const handleCodeProcessed = () => {
        navigation.setParams({ code: undefined });
    };

    useEffect(() => {
        if (cleanCode) {
            console.log("\n=============================");
            console.log("🔥 FAKE CHECKIN CHAMADO 🔥");
            console.log("CÓDIGO RECEBIDO:", cleanCode);
            console.log("=============================\n");
        }
    }, [cleanCode]);

    const firstName = authUser?.name ? authUser.name.split(' ')[0] : 'Visitante';

    return (
        <CheckinProvider>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.greeting}>Olá, {firstName}! 👋</Text>
                    <Text style={styles.subtitle}>
                        Bem-vindo de volta ao seu espaço de inovação.
                    </Text>
                </View>

                <CheckinCard accessCode={cleanCode} onCodeProcessed={handleCodeProcessed} />
            </View>
        </CheckinProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.surface.background,
    },
    headerContainer: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    greeting: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        fontSize: typography.size.xxl,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontFamily: typography.family,
        color: colors.text.secondary,
        fontSize: typography.size.md,
    },
});
