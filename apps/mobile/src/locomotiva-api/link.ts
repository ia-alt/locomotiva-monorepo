import { RPCLink } from '@orpc/client/fetch'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';
import { fetch as expoFetch } from 'expo/fetch';
import { renovarSessao } from './session';

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

const baseFetch = (request: Request) =>
    Platform.OS === 'web' ? globalThis.fetch(request) : nativeFetch(request);

/**
 * Sessão persistente: se a resposta for 401, o token de acesso (curto)
 * provavelmente expirou. Renova pelo refresh token e repete a chamada UMA vez,
 * com o Bearer novo. Se a renovação falhar, devolve o 401 original — a sessão
 * acabou e cabe às telas mandar a pessoa pro login.
 *
 * O clone precisa acontecer ANTES do primeiro envio: o body de uma Request já
 * consumida não pode ser lido de novo.
 */
async function fetchComRenovacao(request: Request): Promise<Response> {
    const copia = request.clone();
    const resposta = await baseFetch(request);
    if (resposta.status !== 401) return resposta;

    const novoToken = await renovarSessao();
    if (!novoToken) return resposta;

    const headers = new Headers(copia.headers);
    headers.set('authorization', `Bearer ${novoToken}`);
    return baseFetch(new Request(copia, { headers }));
}

export const link = new RPCLink({
    url: process.env.EXPO_PUBLIC_API_URL!,
    headers: async () => {
        const token = await AsyncStorage.getItem('token')
        return token ? {
            authorization: `Bearer ${token}`,
        } : {}
    },
    fetch: fetchComRenovacao,
})
