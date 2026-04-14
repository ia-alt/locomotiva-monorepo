import { RPCLink } from '@orpc/client/fetch'
import AsyncStorage from "@react-native-async-storage/async-storage";


export const link = new RPCLink({
    url: process.env.EXPO_PUBLIC_API_URL!,
    headers: async () => {
        const token = await AsyncStorage.getItem('token')
        return token ? {
            authorization: `Bearer ${token}`,
        } : {}
    },
})


