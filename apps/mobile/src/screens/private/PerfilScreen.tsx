import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../../contexts/auth-context';

export default function PerfilScreen() {
    const { authUser, logout } = useAuth();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 16 }}>
            <Text variant="headlineMedium">Perfil</Text>
            <Text variant="bodyMedium">Usuário: {authUser?.name || 'Não identificado'}</Text>

            <Button mode="contained" onPress={() => logout()} style={{ width: '100%', marginTop: 20 }}>
                Sair
            </Button>
        </View>
    );
}
