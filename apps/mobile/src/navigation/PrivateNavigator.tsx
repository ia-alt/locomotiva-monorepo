import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import InicioScreen from '../screens/private/InicioScreen';
import ReservasScreen from '../screens/private/ReservasScreen';
import PerfilScreen from '../screens/private/PerfilScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

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

export default function PrivateNavigator() {
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
