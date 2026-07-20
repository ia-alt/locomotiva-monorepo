import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../services/api';

export const FILAMENTS_QUERY_KEY = ['printing', 'filaments'] as const;

// derivado do contrato da API — ver comentário em usePrintRequestsAdmin
export type Filament = Awaited<ReturnType<typeof orpc.printing.listFilaments>>[number];

export const useFilaments = () => {
  const queryClient = useQueryClient();

  const { data: filaments = [], isLoading, isError, error } = useQuery({
    queryKey: FILAMENTS_QUERY_KEY,
    queryFn: () => orpc.printing.listFilaments({}),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: FILAMENTS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (input: { name: string }) => orpc.printing.createFilament(input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orpc.printing.deleteFilament({ id }),
    onSuccess: invalidate,
  });

  return {
    filaments,
    isLoading,
    isError,
    error,
    createFilament: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error instanceof Error ? createMutation.error.message : null,
    resetCreateError: createMutation.reset,
    deleteFilament: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
