import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../services/api';
import type { Printer } from '../components/printing/PrinterCard';

export const PRINTERS_QUERY_KEY = ['printers'] as const;

export const usePrinters = () => {
  const queryClient = useQueryClient();

  const { data: printers = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: PRINTERS_QUERY_KEY,
    queryFn: () => orpc.printing.listPrinters({}),
  });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; model: string; enabled: boolean; notes?: string | null }) =>
      orpc.printing.createPrinter(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRINTERS_QUERY_KEY });
    },
    onError: (err) => {
      console.error('Failed to create printer:', err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpc.printing.deletePrinter({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRINTERS_QUERY_KEY });
    },
    onError: (err) => {
      console.error('Failed to delete printer:', err);
    },
  });

  const findPrinter = (id: string): Printer | undefined =>
    printers.find((p: Printer) => p.id === id);

  return {
    printers,
    isLoading,
    isError,
    error,
    refetch,
    findPrinter,
    createPrinter: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error instanceof Error ? createMutation.error.message : null,
    resetCreateError: createMutation.reset,
    deletePrinter: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
