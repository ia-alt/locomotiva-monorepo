import React from 'react';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import LoginScreen from '../screens/public/LoginScreen';
import CadastroScreen from '../screens/public/CadastroScreen';
import EsqueciSenhaScreen from '../screens/public/EsqueciSenhaScreen';
import VerificarCodigoScreen from '../screens/public/VerificarCodigoScreen';
import NovaSenhaScreen from '../screens/public/NovaSenhaScreen';

export type PublicStackParamList = {
    Login: undefined;
    Cadastro: undefined;
    EsqueciSenha: { identifier?: string };
    VerificarCodigo: { cpf: string; maskedEmail?: string | null };
    NovaSenha: { cpf: string, code: string };
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
            <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />
            <Stack.Screen name="VerificarCodigo" component={VerificarCodigoScreen} />
            <Stack.Screen name="NovaSenha" component={NovaSenhaScreen} />
        </Stack.Navigator>
    );
}

export function usePublicStackNavigation() {
    return useNavigation<StackNavigationProp<PublicStackParamList>>();
}
