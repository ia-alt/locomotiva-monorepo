import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { CheckinCard } from '../../components/CheckinCard';
import { CheckinProvider } from '../../contexts/checkin-context';
import { useAuth } from '../../contexts/auth-context';

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

    // Fallback to "Visitante" if name is not available, but user wants "Mariana" as example or the actual name from context
    const firstName = authUser?.name ? authUser.name.split(' ')[0] : 'Mariana';

    return (
        <CheckinProvider>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text variant="headlineMedium" style={styles.title}>
                        Olá, {firstName}!
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        Bem-vindo de volta ao seu espaço de inovação ffyugytfuyf.
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
        padding: 20,
    },
    headerContainer: {
        width: '100%',
        marginBottom: 24,
    },
    title: {
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 4,
    },
    subtitle: {
        color: '#64748B',
        fontSize: 16,
    },
});
