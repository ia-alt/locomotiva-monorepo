import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { salvarSessao, limparSessao } from '../locomotiva-api/session';
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
                await salvarSessao(data.token, data.refreshToken);
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
        await salvarSessao(token, refreshToken);
        await getMe();
    };

    const logout = async () => {
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

        // O "sair" é só local, por decisão de produto (03/09/2026): encerrar
        // também a sessão do gov.br exigia navegar até a página de logout dele,
        // e a pessoa deve voltar direto para a tela inicial. Consequência: se o
        // navegador ainda tiver uma sessão gov.br viva, o próximo "Entrar com
        // GOV.BR" pode entrar sem pedir senha. Se isso virar problema, a API
        // aceita GOVBR_PROMPT=login ou GOVBR_MAX_AGE (ver .env.exemple), e a
        // rota identy.getGovbrLogoutUrl continua disponível.
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
