import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import InicioScreen from '../screens/private/InicioScreen';
import ReservasScreen from '../screens/private/ReservasScreen';
import PerfilScreen from '../screens/private/PerfilScreen';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CriarReservaScreen from '../screens/private/CriarReservaScreen';
import DetalhesReservaScreen from '../screens/private/DetalhesReservaScreen';
import ConfirmarReservaScreen from '../screens/private/ConfirmarReservaScreen';
import ReservaSucessoScreen from '../screens/private/ReservaSucessoScreen';

export type PrivateStackParamList = {
    Drawer: undefined;
    CriarReserva: undefined;
    DetalhesReserva: {
        roomId: string;
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
    };
    ReservaSucesso: undefined;
};

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator<PrivateStackParamList>();

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
                    title: 'Locomotiva'
                }}
            />
        </Drawer.Navigator>
    );
}

export default function PrivateNavigator() {
    return (
        <Stack.Navigator initialRouteName="Drawer">
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
        </Stack.Navigator>
    );
}
