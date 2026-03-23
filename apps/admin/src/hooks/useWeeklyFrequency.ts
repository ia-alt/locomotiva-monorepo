import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

export const WEEKLY_FREQUENCY_QUERY_KEY = ['coworking', 'weekly-frequency'] as const;

export type DayFrequency = {
  date: string;
  count: number;
};

export const useWeeklyFrequency = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [...WEEKLY_FREQUENCY_QUERY_KEY],
    queryFn: () => orpc.coworking.getWeeklyFrequency({}),
  });

  return {
    days: (data ?? []) as DayFrequency[],
    isLoading,
    isError,
  };
};
