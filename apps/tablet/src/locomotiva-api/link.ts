import { RPCLink } from '@orpc/client/fetch'

// Chave separada por tipo de totem para não sobrescrever uma com a outra
const LS_KEY = typeof window !== 'undefined' && window.location.pathname.includes('checkout')
    ? 'locomotiva_totem_api_key_checkout'
    : 'locomotiva_totem_api_key_checkin'

const API_KEY = (() => {
    if (typeof window === 'undefined') return ''

    const params = new URLSearchParams(window.location.search)
    const keyFromUrl = params.get('key')

    if (keyFromUrl) {
        localStorage.setItem(LS_KEY, keyFromUrl)
        // Remove o ?key= da URL sem recarregar a página
        params.delete('key')
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '')
        window.history.replaceState(null, '', newUrl)
        return keyFromUrl
    }

    return localStorage.getItem(LS_KEY) ?? ''
})()

// TODO: change to the real server IP/hostname when deploying
export const link = new RPCLink({
    url: 'http://localhost:3000/api',
    headers: () => ({ 'x-api-key': API_KEY }),
})
