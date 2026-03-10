import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/auth-context';
import PublicNavigator from './PublicNavigator';
import PrivateNavigator from './PrivateNavigator';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function Navigation() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Carregando rotas...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <PrivateNavigator /> : <PublicNavigator />}
        </NavigationContainer>
    );
}
