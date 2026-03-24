import React, { createContext, useContext, ReactNode } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useORPC } from '../locomotiva-api/context';
import { ORPCOutputs } from '../locomotiva-api/types';

type Bookings = ORPCOutputs["booking"]["findMyBookings"]["items"];

interface BookingsContextType {
    bookings: Bookings;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isLoading: boolean;
    refetch: () => void;
    isRefetching: boolean;
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export function BookingsProvider({ children }: { children: ReactNode }) {
    const orpc = useORPC();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch,
        isRefetching
    } = useInfiniteQuery({
        queryKey: ['my-bookings'],
        queryFn: async ({ pageParam = 1 }) => {
            return await orpc.booking.findMyBookings.call({
                pagination: { pageNumber: pageParam, pageSize: 10 }
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

    const bookings = data?.pages.flatMap((page) => page.items) ?? [];

    return (
        <BookingsContext.Provider
            value={{
                bookings,
                fetchNextPage,
                hasNextPage: hasNextPage || false,
                isFetchingNextPage,
                isLoading,
                refetch,
                isRefetching
            }}
        >
            {children}
        </BookingsContext.Provider>
    );
}

export function useBookings() {
    const context = useContext(BookingsContext);
    if (context === undefined) {
        throw new Error('useBookings must be used within a BookingsProvider');
    }
    return context;
}
