import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import CheckinCard from '../../components/CheckinCard';
import { CheckinProvider } from '../../contexts/checkin-context';
import { useAuth } from '../../contexts/auth-context';

export default function InicioScreen() {
    const { authUser } = useAuth();

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
                        Bem-vindo de volta ao seu espaço de inovação.
                    </Text>
                </View>

                <CheckinCard />
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
    }
});
