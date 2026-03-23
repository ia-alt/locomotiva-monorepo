import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  userType: string;
};

export const CURRENT_USER_QUERY_KEY = ['identity', 'me'] as const;

export const useCurrentUser = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => orpc.identy.getMe({}),
    staleTime: 5 * 60_000,
  });
  return { user: data as CurrentUser | undefined, isLoading, error };
};
