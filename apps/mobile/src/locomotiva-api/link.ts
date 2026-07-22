import { RPCLink } from '@orpc/client/fetch'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';
import { fetch as expoFetch } from 'expo/fetch';

/**
 * No nativo o fetch do RN não envia FormData com Blob (upload de arquivo pra
 * API); o expo/fetch é spec-compliant e faz o multipart streaming. O Request
 * do RN (polyfill whatwg-fetch) guarda o body original em `_bodyInit` — é ele
 * que repassamos. No web o fetch do navegador já resolve tudo.
 */
function nativeFetch(request: Request): Promise<Response> {
    const body = (request as unknown as { _bodyInit?: unknown })._bodyInit ?? null;
    return expoFetch(request.url, {
        method: request.method,
        headers: Object.fromEntries(request.headers as unknown as Iterable<[string, string]>),
        body: body as never,
        signal: request.signal,
    }) as unknown as Promise<Response>;
}

export const link = new RPCLink({
    url: process.env.EXPO_PUBLIC_API_URL!,
    headers: async () => {
        const token = await AsyncStorage.getItem('token')
        return token ? {
            authorization: `Bearer ${token}`,
        } : {}
    },
    fetch: (request) => (Platform.OS === 'web' ? globalThis.fetch(request) : nativeFetch(request)),
})
