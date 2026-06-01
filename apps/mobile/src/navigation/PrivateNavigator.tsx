import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
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
import EditarPerfilScreen from '../screens/private/EditarPerfilScreen';
import AlterarSenhaScreen from '../screens/private/AlterarSenhaScreen';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ORPCOutputs } from '../locomotiva-api/types';

type RoomFromList = ORPCOutputs["booking"]["listRooms"][0]

export type PrivateStackParamList = {
    Drawer: undefined;
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
    EditarPerfil: undefined;
    AlterarSenha: undefined;
    PerfilIncompleto: undefined;
};

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator<PrivateStackParamList>();

function BottomTabs() {
    return (
        <Tab.Navigator
            initialRouteName="Início"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: { height: 60, paddingBottom: 5, paddingTop: 5 },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Início') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Reservas') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName as any} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Início" component={InicioScreen} />
            <Tab.Screen name="Reservas" component={ReservasScreen} />
            <Tab.Screen name="Perfil" component={PerfilScreen} />
        </Tab.Navigator>
    );
}

function DrawerRoutes() {
    return (
        <Drawer.Navigator initialRouteName="Menu principal">
            <Drawer.Screen
                name="Menu principal"
                component={BottomTabs}
                options={{
                    title: 'Locomotiva',
                    headerLeft: () => null,
                    swipeEnabled: false,
                }}
            />
        </Drawer.Navigator>
    );
}

export default function PrivateNavigator() {
    return (
        <Stack.Navigator initialRouteName="Drawer" screenOptions={{
            animation: 'slide_from_right',
            cardStyle: { flex: 1 },
            cardStyleInterpolator: ({ current }) => ({
                cardStyle: { opacity: current.progress },
            }),
        }}>
            <Stack.Screen
                name="Drawer"
                component={DrawerRoutes}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CriarReserva"
                component={CriarReservaScreen}
                options={{ title: 'Nova Reserva' }}
            />
            <Stack.Screen
                name="DisponibilidadeReserva"
                component={DisponibilidadeReservaScreen}
                options={{ title: 'Data e Horário' }}
            />
            <Stack.Screen
                name="DetalhesReserva"
                component={DetalhesReservaScreen}
                options={{ title: 'Detalhes da Reserva' }}
            />
            <Stack.Screen
                name="ConfirmarReserva"
                component={ConfirmarReservaScreen}
                options={{ title: 'Confirmar Reserva' }}
            />
            <Stack.Screen
                name="ReservaSucesso"
                component={ReservaSucessoScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="DetalhesMinhaReserva"
                component={DetalhesMinhaReservaScreen}
                options={{ title: 'Detalhes da Reserva', animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="EditarPerfil"
                component={EditarPerfilScreen}
                options={{ title: 'Editar Perfil' }}
            />
            <Stack.Screen
                name="AlterarSenha"
                component={AlterarSenhaScreen}
                options={{ title: 'Alterar Senha' }}
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