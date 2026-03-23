import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, CircularProgress, Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import { BOOKINGS_ADMIN_QUERY_KEY } from '../../hooks/useBookingsAdmin';
import type { BookingAdminItem } from '../../hooks/useBookingsAdmin';

interface AdminCancelBookingDialogProps {
  open: boolean;
  onClose: () => void;
  booking: BookingAdminItem | null;
}

export const AdminCancelBookingDialog: React.FC<AdminCancelBookingDialogProps> = ({ open, onClose, booking }) => {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: (params: { bookingId: string; reason: string }) =>
      orpc.booking.adminCancelBooking(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_ADMIN_QUERY_KEY });
      handleClose();
    },
  });

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !reason.trim()) return;
    mutation.mutate({ bookingId: booking.id, reason: reason.trim() });
  };

  if (!booking) return null;

  const error = mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: { sx: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0,0,0,0.2)' } },
        paper: { sx: { borderRadius: 2 } },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Cancelar Reserva</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="body2" color="text.secondary">
              Você está cancelando a reserva de <strong>{booking.user.name}</strong> para{' '}
              <strong>{booking.room.name}</strong> em{' '}
              <strong>{new Date(booking.period.from).toLocaleDateString('pt-BR')}</strong>.
            </Typography>

            <TextField
              label="Motivo do cancelamento"
              fullWidth
              required
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={mutation.isPending}>
            Voltar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={mutation.isPending || !reason.trim()}
            startIcon={mutation.isPending ? <CircularProgress size={18} /> : null}
          >
            {mutation.isPending ? 'Cancelando...' : 'Cancelar Reserva'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
