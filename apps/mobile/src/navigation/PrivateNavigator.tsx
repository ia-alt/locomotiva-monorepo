import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InicioScreen from '../screens/private/InicioScreen';
import ReservasScreen from '../screens/private/ReservasScreen';
import PerfilScreen from '../screens/private/PerfilScreen';

import PerfilIncompletoScreen from '../screens/private/booking-flow/0-PerfilIncompletoScreen';
import CriarReservaScreen from '../screens/private/booking-flow/1-CriarReservaScreen';
import DisponibilidadeReservaScreen from '../screens/private/booking-flow/2-DisponibilidadeReservaScreen';
import DetalhesReservaScreen from '../screens/private/booking-flow/3-DetalhesReservaScreen';
import ConfirmarReservaScreen from '../screens/private/booking-flow/4-ConfirmarReservaScreen';
import ReservaSucessoScreen from '../screens/private/booking-flow/5-ReservaSucessoScreen';
import DetalhesMinhaReservaScreen from '../screens/private/DetalhesMinhaReservaScreen';
import ImpressoesScreen from '../screens/private/ImpressoesScreen';
import CriarImpressaoScreen from '../screens/private/printing-flow/1-CriarImpressaoScreen';
import ConfirmarImpressaoScreen from '../screens/private/printing-flow/2-ConfirmarImpressaoScreen';
import ImpressaoSucessoScreen from '../screens/private/printing-flow/3-ImpressaoSucessoScreen';
import DetalhesMinhaImpressaoScreen from '../screens/private/DetalhesMinhaImpressaoScreen';
import EditarPerfilScreen from '../screens/private/EditarPerfilScreen';
import AlterarSenhaScreen from '../screens/private/AlterarSenhaScreen';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { NavigatorScreenParams, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ORPCOutputs } from '../locomotiva-api/types';
import { BarraDeAbas, Icone, cores, fontes } from '../ui';

type RoomFromList = ORPCOutputs["booking"]["listRooms"][0]

/** As quatro abas da barra de baixo. */
export type AbasParamList = {
    /** `code` chega pelo link do QR code de check-in (ver `navigation/index.tsx`). */
    'Início': { code?: string } | undefined;
    Reservas: undefined;
    'Impressões': undefined;
    Perfil: undefined;
};

export type PrivateStackParamList = {
    Abas: NavigatorScreenParams<AbasParamList> | undefined;
    CriarReserva: undefined;
    DisponibilidadeReserva: {
        room: RoomFromList
    };
    DetalhesReserva: {
        room: RoomFromList;
        day: string;
        startTime: {hour: number, minute: number, second: number};
        endTime: {hour: number, minute: number, second: number};
    };
    ConfirmarReserva: {
        room: RoomFromList;
        day: string;
        startTime: {hour: number, minute: number, second: number};
        endTime: {hour: number, minute: number, second: number};
        title: string;
        description: string;
        numberOfPeople: number;
    };
    ReservaSucesso: undefined;
    DetalhesMinhaReserva: {
        bookingId: string;
    };
    CriarImpressao: undefined;
    ConfirmarImpressao: {
        /** só os metadados: o arquivo em si fica em `utils/pick-print-file` até o envio */
        stlFile: { fileName: string; fileSizeBytes: number | null };
        gcodeFile: { fileName: string; fileSizeBytes: number | null };
        filamentId: string;
        material: string;
        purpose: string;
    };
    ImpressaoSucesso: undefined;
    DetalhesMinhaImpressao: {
        printRequestId: string;
    };
    EditarPerfil: undefined;
    AlterarSenha: undefined;
    /** next = para onde seguir após completar o perfil (default: fluxo de reserva) */
    PerfilIncompleto: { next: 'CriarReserva' | 'CriarImpressao' } | undefined;
};

const Abas = createBottomTabNavigator<AbasParamList>();
const Stack = createStackNavigator<PrivateStackParamList>();

function AbasPrincipais() {
    return (
        <Abas.Navigator
            initialRouteName="Início"
            tabBar={(props) => <BarraDeAbas {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Abas.Screen
                name="Início"
                component={InicioScreen}
                options={{ tabBarIcon: ({ color }) => <Icone nome="inicio" cor={color} /> }}
            />
            <Abas.Screen
                name="Reservas"
                component={ReservasScreen}
                options={{ tabBarIcon: ({ color }) => <Icone nome="reservas" cor={color} /> }}
            />
            <Abas.Screen
                name="Impressões"
                component={ImpressoesScreen}
                options={{ tabBarIcon: ({ color }) => <Icone nome="impressoes" cor={color} /> }}
            />
            <Abas.Screen
                name="Perfil"
                component={PerfilScreen}
                options={{ tabBarIcon: ({ color }) => <Icone nome="perfil" cor={color} /> }}
            />
        </Abas.Navigator>
    );
}

export default function PrivateNavigator() {
    return (
        <Stack.Navigator initialRouteName="Abas" screenOptions={{
            animation: 'slide_from_right',
            cardStyle: { flex: 1, backgroundColor: cores.chao },
            cardStyleInterpolator: ({ current }) => ({
                cardStyle: { opacity: current.progress },
            }),
            // A MolduraSegura (layout-context) já reserva a barra de status.
            // Sem zerar aqui, o cabeçalho reservava de novo e sobrava um vão em cima.
            headerStatusBarHeight: 0,
            headerStyle: { backgroundColor: cores.chao },
            headerShadowVisible: false,
            headerTintColor: cores.grafite,
            headerTitleAlign: 'left',
            headerTitleStyle: { fontFamily: fontes.placaMedia, fontSize: 18 },
            headerBackButtonDisplayMode: 'minimal',
        }}>
            <Stack.Screen
                name="Abas"
                component={AbasPrincipais}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CriarReserva"
                component={CriarReservaScreen}
                options={{ title: 'Nova reserva' }}
            />
            <Stack.Screen
                name="DisponibilidadeReserva"
                component={DisponibilidadeReservaScreen}
                options={{ title: 'Data e horário' }}
            />
            <Stack.Screen
                name="DetalhesReserva"
                component={DetalhesReservaScreen}
                options={{ title: 'Detalhes da reserva' }}
            />
            <Stack.Screen
                name="ConfirmarReserva"
                component={ConfirmarReservaScreen}
                options={{ title: 'Confirmar reserva' }}
            />
            <Stack.Screen
                name="ReservaSucesso"
                component={ReservaSucessoScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="DetalhesMinhaReserva"
                component={DetalhesMinhaReservaScreen}
                options={{ title: 'Detalhes da reserva', animation: 'slide_from_right' }}
            />
            <Stack.Screen name="CriarImpressao" component={CriarImpressaoScreen} options={{ title: 'Nova impressão' }} />
            <Stack.Screen name="ConfirmarImpressao" component={ConfirmarImpressaoScreen} options={{ title: 'Confirmar pedido' }} />
            <Stack.Screen name="ImpressaoSucesso" component={ImpressaoSucessoScreen} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="DetalhesMinhaImpressao" component={DetalhesMinhaImpressaoScreen} options={{ title: 'Detalhes da impressão', animation: 'slide_from_right' }} />
            <Stack.Screen
                name="EditarPerfil"
                component={EditarPerfilScreen}
                options={{ title: 'Editar perfil' }}
            />
            <Stack.Screen
                name="AlterarSenha"
                component={AlterarSenhaScreen}
                options={{ title: 'Alterar senha' }}
            />
            <Stack.Screen
                name="PerfilIncompleto"
                component={PerfilIncompletoScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

export function usePrivateStackNavigation() {
    return useNavigation<StackNavigationProp<PrivateStackParamList>>();
}

export function usePrivateStackRoute<T extends keyof PrivateStackParamList>() {
    type ScreenRouteProp = RouteProp<PrivateStackParamList, T>;
    const route = useRoute<ScreenRouteProp>();
    return route;
}
