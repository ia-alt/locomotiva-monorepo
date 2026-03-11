import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../services/api';
import type { Room } from '../components/rooms/RoomCard';

export const ROOMS_QUERY_KEY = ['rooms'] as const;

export const useRooms = () => {
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading, isError, error } = useQuery({
    queryKey: ROOMS_QUERY_KEY,
    queryFn: () => orpc.booking.listRooms({}),
  });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; capacity: number; enabled: boolean }) =>
      orpc.booking.createRoom(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
    },
    onError: (err) => {
      console.error('Failed to create room:', err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => orpc.booking.deleteRoom({ roomId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
    },
    onError: (err) => {
      console.error('Failed to delete room:', err);
    },
  });

  const findRoom = (id: string): Room | undefined =>
    rooms.find((r: Room) => r.id === id);

  return {
    rooms,
    isLoading,
    isError,
    error,
    findRoom,
    createRoom: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error instanceof Error ? createMutation.error.message : null,
    deleteRoom: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
