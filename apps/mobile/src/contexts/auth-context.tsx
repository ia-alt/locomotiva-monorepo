import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    /** Cria a sessão a partir de um token já emitido — usado pelo login gov.br. */
    loginWithToken: (token: string) => Promise<void>;
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
            console.error(error);
        } finally {
            setIsUserLoading(false);
        }
    }

    const loginMutation = useMutation({
        ...orpc.identy.login.mutationOptions(),
        onSuccess: async (data) => {
            if (data?.token) {
                await AsyncStorage.setItem('token', data.token);
                // Registrado para o logout saber se também precisa encerrar a
                // sessão no gov.br. Quem entrou por senha faz só logout local.
                await AsyncStorage.setItem('loginMethod', 'password');
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
     * No fluxo gov.br o token já vem emitido pela API — a senha nunca passa por
     * aqui. Guarda e carrega o usuário, igual ao final do login normal.
     */
    const loginWithToken = async (token: string) => {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('loginMethod', 'govbr');
        await getMe();
    };

    const logout = async () => {
        const loginMethod = await AsyncStorage.getItem('loginMethod');

        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('loginMethod');
        queryClient.clear();
        setAuthUser(null);

        // Quem entrou pelo gov.br também sai do gov.br. Sem isso, num
        // computador compartilhado o próximo clique em "Entrar com GOV.BR"
        // entraria na conta anterior sem pedir senha.
        if (loginMethod === 'govbr' && typeof window !== 'undefined') {
            try {
                const { url } = await orpc.identy.getGovbrLogoutUrl.call({});
                if (url) {
                    window.location.assign(url);
                }
            } catch {
                // Sessão local já foi encerrada; a do gov.br expira sozinha.
            }
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

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
