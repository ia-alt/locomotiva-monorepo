import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

export const RECENT_ACTIVITIES_QUERY_KEY = ['coworking', 'recent-activities'] as const;

export const useRecentActivities = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...RECENT_ACTIVITIES_QUERY_KEY],
    queryFn: () => orpc.coworking.getRecentActivities({}),
    refetchInterval: 60 * 1_000,
    staleTime: 60 * 1_000,
  });

  return { data, isLoading, isError, error };
};
