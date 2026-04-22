import React, { createContext, useContext, useMemo } from 'react';
import { useORPC } from '../locomotiva-api/context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type CheckinContextType = {
    isCheckedIn: boolean;
    checkInTime: Date | null;
    isLoading: boolean;
    checkIn: (accessCode: string) => Promise<void>;
    checkOut: () => Promise<void>;
};


const CheckinContext = createContext<CheckinContextType | undefined>(undefined);

export function CheckinProvider({ children }: { children: React.ReactNode }) {
    const orpc = useORPC();
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery(orpc.coworking.getMyCheckinStatus.queryOptions({ input: {}, refetchInterval: 1000 * 10 }));

    const isCheckedIn = !!data;
    const checkInTime = useMemo(() => data?.entryTime ? new Date(data.entryTime) : null, [data?.entryTime]);

    const { mutateAsync: doCheckIn } = useMutation(orpc.coworking.checkin.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(orpc.coworking.getMyCheckinStatus.key() as any);
        }
    }));
    const { mutateAsync: doCheckOut } = useMutation(orpc.coworking.checkout.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(orpc.coworking.getMyCheckinStatus.key() as any);
        }
    }));

    const checkIn = React.useCallback(async (accessCode: string) => {
        console.log("chamou. O que mudou?", accessCode, isLoading, isCheckedIn, doCheckIn.name)
        await doCheckIn({ accessCode });
    }, [doCheckIn]);

    const checkOut = React.useCallback(async () => {
        await doCheckOut({});
    }, [doCheckOut]);

    const value = useMemo(() => {
        return {
            isCheckedIn,
            checkInTime,
            isLoading,
            checkIn,
            checkOut
        }
    }, [isCheckedIn, checkInTime, isLoading, checkIn, checkOut]);

    return (
        <CheckinContext.Provider value={value}>
            {children}
        </CheckinContext.Provider>
    );
}

export function useCheckin() {
    const context = useContext(CheckinContext);
    if (context === undefined) {
        throw new Error('useCheckin deve ser usado dentro de um CheckinProvider');
    }
    return context;
}
