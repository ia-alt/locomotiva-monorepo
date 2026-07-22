import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

export const PRINT_REQUESTS_ADMIN_QUERY_KEY = ['printing', 'admin-search'] as const;

// Tipos derivados do contrato da API — se a rota mudar, o erro aparece aqui no
// tsc em vez de virar `undefined` na tela. Não escrever à mão nem usar `as`.
export type PrintRequestAdminItem = Awaited<ReturnType<typeof orpc.printing.findPrintRequestsAdmin>>['items'][number];

// o arquivo é uma entidade do storage: id + nome + flag de exclusão lógica
// (o path do bucket não circula mais; download é via rota assinada)
export type PrintRequestFile = PrintRequestAdminItem['stlFile'];

type UsePrintRequestsAdminParams = {
  page: number;
  pageSize: number;
  statusFilter?: string[];
  printerIdFilter?: string;
  search?: string;
};

export const usePrintRequestsAdmin = ({
  page,
  pageSize,
  statusFilter,
  printerIdFilter,
  search,
}: UsePrintRequestsAdminParams) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...PRINT_REQUESTS_ADMIN_QUERY_KEY, page, pageSize, statusFilter, printerIdFilter, search],
    queryFn: () =>
      orpc.printing.findPrintRequestsAdmin({
        pagination: { pageNumber: page, pageSize },
        filter: {
          status: statusFilter?.length ? statusFilter : undefined,
          printerId: printerIdFilter || undefined,
          search: search || undefined,
        },
      }),
    staleTime: 30 * 1_000,
  });

  return {
    printRequests: data?.items ?? [],
    pagesCount: data?.pagesCount ?? 0,
    isLoading,
    isError,
    error,
  };
};
