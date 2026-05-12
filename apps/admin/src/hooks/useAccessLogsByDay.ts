import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

export const ACCESS_LOGS_BY_DAY_QUERY_KEY = ['access-logs-by-day'] as const;

export const useAccessLogsByDay = (day: string | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...ACCESS_LOGS_BY_DAY_QUERY_KEY, day],
    queryFn: () => orpc.coworking.listAccessLogsByDay({ day: day! }),
    enabled: !!day,
  });

  return {
    items: data ?? [],
    isLoading,
    isError,
    error,
  };
};
