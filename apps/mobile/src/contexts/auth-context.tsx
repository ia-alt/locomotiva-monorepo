import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useORPC } from '../locomotiva-api/context';
import { ORPCOutputs, ORPCInputs } from '../locomotiva-api/types';

type LoginInput = ORPCInputs['identy']['login'];
type User = ORPCOutputs['identy']['getMe'];
type RegisterUserInput = ORPCInputs['identy']['registerUser'];


type AuthContextType = {
    authUser: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginInput) => Promise<void>;
    logout: () => Promise<void>;
    register: (newUserData: RegisterUserInput) => Promise<void>;
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

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        queryClient.clear();
        setAuthUser(null);
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

    const isLoading = !isReady || isUserLoading;
    const isAuthenticated = !!authUser;

    return (
        <AuthContext.Provider value={{
            authUser: (authUser as any) || null,
            isAuthenticated,
            login,
            logout,
            register,
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
