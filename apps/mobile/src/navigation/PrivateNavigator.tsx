import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import InicioScreen from '../screens/private/InicioScreen';
import ReservasScreen from '../screens/private/ReservasScreen';
import PerfilScreen from '../screens/private/PerfilScreen';

import CriarReservaScreen from '../screens/private/CriarReservaScreen';
import DisponibilidadeReservaScreen from '../screens/private/DisponibilidadeReservaScreen';
import DetalhesReservaScreen from '../screens/private/DetalhesReservaScreen';
import ConfirmarReservaScreen from '../screens/private/ConfirmarReservaScreen';
import ReservaSucessoScreen from '../screens/private/ReservaSucessoScreen';
import DetalhesMinhaReservaScreen from '../screens/private/DetalhesMinhaReservaScreen';
import EditarPerfilScreen from '../screens/private/EditarPerfilScreen';
import AlterarSenhaScreen from '../screens/private/AlterarSenhaScreen';
import PerfilIncompletoScreen from '../screens/private/PerfilIncompletoScreen';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

export type PrivateStackParamList = {
    Drawer: undefined;
    CriarReserva: undefined;
    DisponibilidadeReserva: {
        roomId: string;
        roomCapacity: number;
    };
    DetalhesReserva: {
        roomId: string;
        roomCapacity: number;
        date: string;
        startTime: string;
        endTime: string;
    };
    ConfirmarReserva: {
        roomId: string;
        date: string;
        startTime: string;
        endTime: string;
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