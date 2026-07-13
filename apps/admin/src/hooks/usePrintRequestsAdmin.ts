import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

export const PRINT_REQUESTS_ADMIN_QUERY_KEY = ['printing', 'admin-search'] as const;

// o arquivo agora é uma entidade do storage: a API manda id + nome + flag de
// exclusão lógica (o path do bucket não circula mais; download é via rota assinada)
export type PrintRequestFile = { id: string; name: string; sizeBytes: number; deleted: boolean };

export type PrintRequestAdminItem = {
  id: string;
  user: { id: string; name: string; email: string };
  printer: { id: string; name: string } | null;
  purpose: string;
  stlFile: PrintRequestFile;
  gcodeFile: PrintRequestFile;
  material: string;
  status: string;
  rejectionCancelReason: string | null;
  createdAt: string;
};

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
    printRequests: (data?.items ?? []) as PrintRequestAdminItem[],
    pagesCount: data?.pagesCount ?? 0,
    isLoading,
    isError,
    error,
  };
};
