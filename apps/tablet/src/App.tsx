import React from 'react'
import { View, Platform } from 'react-native'
import { MD3LightTheme, PaperProvider } from 'react-native-paper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ORPCProvider } from './locomotiva-api/provider'
import TotemScreen from './screens/TotemScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import { NotificationProvider } from './providers/notification'

const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#1A7BFF',
        background: '#F3F6FA',
        surface: '#FFFFFF',
        onSurface: '#1E293B',
        outline: '#CBD5E1',
        onSurfaceVariant: '#94A3B8',
    },
}

const queryClient = new QueryClient()

// Decide qual totem mostrar com base na URL (web) ou padrão (nativo)
// Acesso: /         → check-in
// Acesso: /checkout → check-out
function resolveScreen(): 'checkin' | 'checkout' {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (window.location.pathname.includes('checkout')) return 'checkout'
    }
    return 'checkin'
}

const screen = resolveScreen()

export default function App() {
    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <ORPCProvider>
                        <NotificationProvider>
                            <StatusBar style="light" hidden />
                            <View style={{ flex: 1 }}>
                                {screen === 'checkout' ? <CheckoutScreen /> : <TotemScreen />}
                            </View>
                        </NotificationProvider>
                    </ORPCProvider>
                </QueryClientProvider>
            </PaperProvider>
        </SafeAreaProvider>
    )
}
