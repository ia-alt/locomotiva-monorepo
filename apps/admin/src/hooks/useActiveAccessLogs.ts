import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

export const ACTIVE_ACCESS_LOGS_QUERY_KEY = ['active-access-logs'] as const;

export type ActiveSession = {
  logId: string;
  userId: string;
  userName: string;
  userEmail: string;
  entryTime: string;
};

export const useActiveAccessLogs = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...ACTIVE_ACCESS_LOGS_QUERY_KEY],
    queryFn: () => orpc.coworking.listActiveSessions(),
    refetchInterval: 60_000,
  });

  return {
    sessions: (data ?? []) as ActiveSession[],
    isLoading,
    isError,
    error,
    refetch,
  };
};
