import { RPCLink } from '@orpc/client/fetch'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const LS_API_KEY = 'locomotiva_tablet_api_key'

export const link = new RPCLink({
    url: process.env.EXPO_PUBLIC_API_URL!,
    headers: async () => {
        const apiKey = await AsyncStorage.getItem(LS_API_KEY)
        return apiKey ? { 'x-api-key': apiKey } : {}
    },
})
