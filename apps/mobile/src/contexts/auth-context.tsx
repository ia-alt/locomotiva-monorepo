import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { salvarSessao, limparSessao, lerMetodoDeLogin } from '../locomotiva-api/session';
import { linkDoAppParaLogout } from '../govbr/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useORPC } from '../locomotiva-api/context';
import { ORPCOutputs, ORPCInputs } from '../locomotiva-api/types';

type LoginInput = ORPCInputs['identy']['login'];
type User = ORPCOutputs['identy']['getMe'];
type RegisterUserInput = ORPCInputs['identy']['registerUser'];
type UpdateMeInput = ORPCInputs['identy']['updateMe'];

type AuthContextType = {
    authUser: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginInput) => Promise<void>;
    /** Cria a sessão a partir de tokens já emitidos — usado pelo login gov.br. */
    loginWithToken: (token: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (newUserData: RegisterUserInput) => Promise<void>;
    updateMe: (data: UpdateMeInput) => Promise<void>;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const orpc = useORPC();
    const queryClient = useQueryClient();
    const [isReady, setIsReady] = useState(false);

    const [authUser, setAuthUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(false);

    async function getMe() {
        setIsUserLoading(true);
        try {
            const response = await orpc.identy.getMe.call({})
            setAuthUser(response);
        } catch (error) {
            // 401 aqui significa que a sessão acabou de verdade: o interceptador
            // do link já tentou renovar e falhou. A pessoa volta ao login sem
            // alarde — não é um erro do aplicativo.
            if (ehNaoAutorizado(error)) {
                await limparSessao();
                setAuthUser(null);
                return;
            }
            console.error(error);
        } finally {
            setIsUserLoading(false);
        }
    }

    const loginMutation = useMutation({
        ...orpc.identy.login.mutationOptions(),
        onSuccess: async (data) => {
            if (data?.token) {
                await salvarSessao(data.token, data.refreshToken, 'password');
            }
            getMe();
        },
    });

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                getMe();
            }
            setIsReady(true);
        };
        checkToken();
    }, []);

    const login = async (credentials: LoginInput) => {
        await loginMutation.mutateAsync(credentials);
    };

    /**
     * No fluxo gov.br os tokens já vêm emitidos pela API — a senha nunca passa
     * por aqui. Guarda e carrega o usuário, igual ao final do login normal.
     */
    const loginWithToken = async (token: string, refreshToken: string) => {
        // Único caminho que chega aqui é o gov.br (callback, cadastro e vínculo).
        await salvarSessao(token, refreshToken, 'govbr');
        await getMe();
    };

    const logout = async () => {
        // Lido antes de limpar: decide se há sessão gov.br a encerrar.
        const metodo = await lerMetodoDeLogin();

        // Revoga a sessão persistente NO SERVIDOR antes de esquecê-la aqui.
        // Sem isso o "sair" seria só cosmético: o refresh token continuaria
        // válido no banco até expirar.
        try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
                await orpc.identy.logout.call({ refreshToken });
            }
        } catch {
            // Sem rede, sai mesmo assim: a sessão local morre agora e a do
            // servidor expira sozinha.
        }

        await limparSessao();
        queryClient.clear();
        setAuthUser(null);

        // Quem entrou pelo gov.br também sai de lá (roteiro do gov.br, passo 12:
        // "implementação obrigatória", a partir do front-end). Sem isso, o
        // próximo "Entrar com GOV.BR" entra sem senha na conta anterior — e o
        // gov.br ignora `prompt=login`/`max_age`, então não há atalho. Quem
        // entrou por senha não tem sessão gov.br: abrir o gov.br nesse caso o
        // fazia mostrar a tela de login dele (03/09/2026).
        if (metodo !== 'govbr') return;

        try {
            const { url } = await orpc.identy.getGovbrLogoutUrl.call({
                client: Platform.OS === 'web' ? 'web' : 'app',
            });
            if (!url) return;

            if (Platform.OS === 'web') {
                // Vai ao gov.br e volta para a home, já deslogada.
                window.location.assign(url);
                return;
            }

            // No app: a URL é a página de saída da web, que passa pelo gov.br e
            // reabre o app pelo link dele — o navegador fecha sozinho. Não se
            // espera pela promessa: a tela de login já está por baixo, e se a
            // pessoa fechar o navegador na mão o resultado é o mesmo.
            WebBrowser.openAuthSessionAsync(url, linkDoAppParaLogout(), { preferEphemeralSession: true })
                .catch(() => { /* já está deslogada localmente */ });
        } catch {
            // Integração desligada ou sem rede: a sessão do gov.br expira sozinha.
        }
    };

    const registerMutation = useMutation({
        ...orpc.identy.registerUser.mutationOptions(),
        onSuccess: async (_, { email, password }) => {
            await login({ identifier: email, password });
        },
    });

    const register = async (credentials: RegisterUserInput) => {
        await registerMutation.mutateAsync(credentials);
    };

    const updateMeMutation = useMutation({
        ...orpc.identy.updateMe.mutationOptions(),
        onSuccess: (data) => {
            setAuthUser(data as any);
        },
    });

    const updateMe = async (data: UpdateMeInput) => {
        await updateMeMutation.mutateAsync(data);
    };

    const refreshUser = async () => {
        await getMe();
    };

    const isLoading = !isReady || isUserLoading;
    const isAuthenticated = !!authUser;

    return (
        <AuthContext.Provider value={{
            authUser: (authUser as any) || null,
            isAuthenticated,
            login,
            loginWithToken,
            logout,
            register,
            updateMe,
            refreshUser,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

function ehNaoAutorizado(e: unknown): boolean {
    return typeof e === 'object' && e !== null && (e as { code?: string }).code === 'UNAUTHORIZED';
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
