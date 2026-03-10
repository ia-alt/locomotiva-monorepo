import { RPCLink } from '@orpc/client/fetch'
import AsyncStorage from "@react-native-async-storage/async-storage";


export const link = new RPCLink({
    url: 'http://localhost:3000/api',
    headers: async () => {
        const token = await AsyncStorage.getItem('token')
        return token ? {
            authorization: `Bearer ${token}`,
        } : {}
    },
})


