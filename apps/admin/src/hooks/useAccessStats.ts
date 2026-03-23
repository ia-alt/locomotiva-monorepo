import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

export const ACCESS_STATS_QUERY_KEY = ['coworking', 'access-stats'] as const;

export const useAccessStats = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...ACCESS_STATS_QUERY_KEY],
    queryFn: () => orpc.coworking.getAccessStats({}),
    staleTime: 5 * 60 * 1_000,
  });

  return { data, isLoading, isError, error };
};
