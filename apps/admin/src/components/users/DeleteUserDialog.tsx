import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import { USERS_QUERY_KEY } from '../../hooks/useUsers';

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ open, onClose, userId, userName }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => orpc.identy.deleteUser({ userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      onClose();
    },
    onError: (err) => {
      console.error('Failed to delete user:', err);
    },
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { sx: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0, 0, 0, 0.2)' } },
      }}
    >
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir o usuário <strong>{userName}</strong>? Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button
          onClick={() => mutation.mutate()}
          color="error"
          variant="contained"
          disabled={mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={18} /> : null}
        >
          {mutation.isPending ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
