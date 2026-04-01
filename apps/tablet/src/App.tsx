import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { MD3LightTheme, PaperProvider } from 'react-native-paper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ORPCProvider } from './locomotiva-api/provider'
import { LS_API_KEY } from './locomotiva-api/link'
import TotemScreen from './screens/TotemScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import SetupScreen, { LS_TABLET_MODE } from './screens/SetupScreen'
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

type AppState = 'loading' | 'setup' | 'checkin' | 'checkout'

function AppContent() {
    const [state, setState] = useState<AppState>('loading')

    useEffect(() => {
        async function loadConfig() {
            const [apiKey, mode] = await Promise.all([
                AsyncStorage.getItem(LS_API_KEY),
                AsyncStorage.getItem(LS_TABLET_MODE),
            ])

            if (apiKey && (mode === 'checkin' || mode === 'checkout')) {
                setState(mode)
            } else {
                setState('setup')
            }
        }

        loadConfig()
    }, [])

    if (state === 'loading') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F6FA' }}>
                <ActivityIndicator size="large" color="#1A7BFF" />
            </View>
        )
    }

    if (state === 'setup') {
        return <SetupScreen onConfigured={(mode) => setState(mode)} />
    }

    return (
        <NotificationProvider>
            {state === 'checkout' ? <CheckoutScreen /> : <TotemScreen />}
        </NotificationProvider>
    )

}

export default function App() {
    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <ORPCProvider>
                        <StatusBar style="light" hidden />
                        <View style={{ flex: 1 }}>
                            <AppContent />
                        </View>
                    </ORPCProvider>
                </QueryClientProvider>
            </PaperProvider>
        </SafeAreaProvider >
    )
}
