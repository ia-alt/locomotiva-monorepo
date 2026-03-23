import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

export const USERS_QUERY_KEY = ['users'] as const;

export type UserItem = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  userType: 'user' | 'admin' | 'system';
};

export const useUsers = (pageNumber: number, pageSize: number, search: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...USERS_QUERY_KEY, pageNumber, pageSize, search],
    queryFn: () => orpc.identy.listUsers({ pagination: { pageNumber, pageSize }, search: search || undefined }),
  });

  return {
    users: (data?.items ?? []) as UserItem[],
    pagesCount: data?.pagesCount ?? 0,
    currentPage: data?.currentPage ?? pageNumber,
    isLoading,
    isError,
    error,
  };
};
