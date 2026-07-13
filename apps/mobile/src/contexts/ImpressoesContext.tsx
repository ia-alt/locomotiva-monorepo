import React, { createContext, useContext, ReactNode } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useORPC } from '../locomotiva-api/context';
import { ORPCOutputs } from '../locomotiva-api/types';

type PrintRequests = ORPCOutputs["printing"]["findMyPrintRequests"]["items"];

interface PrintRequestsContextType {
    printRequests: PrintRequests;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isLoading: boolean;
    refetch: () => void;
    isRefetching: boolean;
}

const PrintRequestsContext = createContext<PrintRequestsContextType | undefined>(undefined);

export function ImpressoesProvider({ children }: { children: ReactNode }) {
    const orpc = useORPC();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch,
        isRefetching,
    } = useInfiniteQuery({
        queryKey: ['my-print-requests'],
        queryFn: async ({ pageParam = 1 }) => {
            return await orpc.printing.findMyPrintRequests.call({
                pagination: { pageNumber: pageParam, pageSize: 10 },
            });
        },
        getNextPageParam: (lastPage: any) => {
            if (lastPage.currentPage < lastPage.pagesCount) {
                return lastPage.currentPage + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    const printRequests = data?.pages.flatMap((page) => page.items) ?? [];

    return (
        <PrintRequestsContext.Provider
            value={{
                printRequests,
                fetchNextPage,
                hasNextPage: hasNextPage || false,
                isFetchingNextPage,
                isLoading,
                refetch,
                isRefetching,
            }}
        >
            {children}
        </PrintRequestsContext.Provider>
    );
}

export function useImpressoes() {
    const context = useContext(PrintRequestsContext);
    if (context === undefined) {
        throw new Error('useImpressoes must be used within an ImpressoesProvider');
    }
    return context;
}
