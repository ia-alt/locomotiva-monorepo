import React from 'react';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import LoginScreen from '../screens/public/LoginScreen';
import CadastroScreen from '../screens/public/CadastroScreen';

export type PublicStackParamList = {
    Login: undefined;
    Cadastro: undefined;
};

const Stack = createStackNavigator<PublicStackParamList>();

export default function PublicNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                cardStyle: { flex: 1 },
            }}
            id='public-stack'
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
        </Stack.Navigator>
    );
}

export function usePublicStackNavigation() {
    return useNavigation<StackNavigationProp<PublicStackParamList>>();
}
