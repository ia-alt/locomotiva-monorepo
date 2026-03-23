import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

export const BOOKINGS_ADMIN_QUERY_KEY = ['booking', 'admin-search'] as const;

export type BookingAdminItem = {
  id: string;
  user: { id: string; name: string; email: string };
  room: { id: string; name: string; capacity: number };
  period: { from: string; to: string };
  status: string;
  title: string;
  description?: string;
  rejectionCancelReason?: string;
  createdAt: string;
};

type UseBookingsAdminParams = {
  page: number;
  pageSize: number;
  statusFilter?: string[];
  roomIdFilter?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const useBookingsAdmin = ({
  page,
  pageSize,
  statusFilter,
  roomIdFilter,
  search,
  dateFrom,
  dateTo,
}: UseBookingsAdminParams) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...BOOKINGS_ADMIN_QUERY_KEY, page, pageSize, statusFilter, roomIdFilter, search, dateFrom, dateTo],
    queryFn: () =>
      orpc.booking.findBookingsAdmin({
        pagination: { pageNumber: page, pageSize },
        filter: {
          status: statusFilter?.length ? statusFilter : undefined,
          roomId: roomIdFilter || undefined,
          search: search || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      }),
    staleTime: 30 * 1_000,
  });

  return {
    bookings: (data?.items ?? []) as BookingAdminItem[],
    pagesCount: data?.pagesCount ?? 0,
    total: data?.total ?? 0,
    isLoading,
    isError,
    error,
  };
};
