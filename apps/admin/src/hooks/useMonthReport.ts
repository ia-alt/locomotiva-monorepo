import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

export const useMonthReport = (date: string) => {
  return useQuery({
    queryKey: ['report', 'month', date],
    queryFn: () => orpc.report.generateMonthReport({ date }),
    staleTime: 0,
  });
};
