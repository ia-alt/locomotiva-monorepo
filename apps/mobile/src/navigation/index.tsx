import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { useAuth } from '../contexts/auth-context';
import PublicNavigator from './PublicNavigator';
import PrivateNavigator from './PrivateNavigator';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

const linking: LinkingOptions<any> = {
    prefixes: ['locomotiva://', 'http://192.168.1.12:8081/', 'https://192.168.1.12:8081/'],
    config: {
        screens: {
            Drawer: {
                screens: {
                    'Menu principal': {
                        screens: {
                            'Início': 'checkin',
                        }
                    }
                }
            }
        }
    }
};

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
        <NavigationContainer linking={linking}>
            {isAuthenticated ? <PrivateNavigator /> : <PublicNavigator />}
        </NavigationContainer>
    );
}
