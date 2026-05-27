import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, CircularProgress, Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import { BOOKINGS_ADMIN_QUERY_KEY } from '../../hooks/useBookingsAdmin';
import type { BookingAdminItem } from '../../hooks/useBookingsAdmin';
import { onlyDateStrToBrDate, onlyTimeObjToTimeStr } from '../../utils/datetime-formatters';

interface ProcessBookingDialogProps {
  open: boolean;
  onClose: () => void;
  booking: BookingAdminItem | null;
}

export const ProcessBookingDialog: React.FC<ProcessBookingDialogProps> = ({ open, onClose, booking }) => {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<'confirm' | 'reject' | null>(null);
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: (params: { bookingId: string; decision: { type: 'confirm' } | { type: 'reject'; reason: string } }) =>
      orpc.booking.processBookingRequest(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_ADMIN_QUERY_KEY });
      handleClose();
    },
  });

  const handleClose = () => {
    setDecision(null);
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    if (!booking) return;
    mutation.mutate({ bookingId: booking.id, decision: { type: 'confirm' } });
  };

  const handleReject = () => {
    if (!booking || !reason.trim()) return;
    mutation.mutate({ bookingId: booking.id, decision: { type: 'reject', reason: reason.trim() } });
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
      <DialogTitle sx={{ fontWeight: 'bold' }}>Processar Solicitação</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
            <Typography variant="body2" color="text.secondary">Solicitante</Typography>
            <Typography variant="body1" fontWeight={500}>{booking.user.name}</Typography>
            <Typography variant="body2" color="text.secondary">{booking.user.email}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1, bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
              <Typography variant="body2" color="text.secondary">Sala</Typography>
              <Typography variant="body1" fontWeight={500}>{booking.room.name}</Typography>
              <Typography variant="body2" color="text.secondary">Cap. {booking.room.capacity}</Typography>
            </Box>
            <Box sx={{ flex: 1, bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
              <Typography variant="body2" color="text.secondary">Data e Horário</Typography>
              <Typography variant="body1" fontWeight={500}>
                {onlyDateStrToBrDate(booking.day)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {onlyTimeObjToTimeStr(booking.timeInterval.start)}
                {' – '}
                {onlyTimeObjToTimeStr(booking.timeInterval.end)}
              </Typography>
            </Box>
          </Box>

          {booking.description && (
            <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 2 }}>
              <Typography variant="body2" color="text.secondary">Finalidade</Typography>
              <Typography variant="body1">{booking.description}</Typography>
            </Box>
          )}

          {decision === 'reject' && (
            <TextField
              label="Motivo da rejeição"
              fullWidth
              required
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} color="inherit" disabled={mutation.isPending}>
          Cancelar
        </Button>

        {decision === null && (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDecision('reject')}
              disabled={mutation.isPending}
            >
              Rejeitar
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirm}
              disabled={mutation.isPending}
              startIcon={mutation.isPending ? <CircularProgress size={18} /> : null}
            >
              {mutation.isPending ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </>
        )}

        {decision === 'reject' && (
          <>
            <Button onClick={() => setDecision(null)} color="inherit" disabled={mutation.isPending}>
              Voltar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleReject}
              disabled={mutation.isPending || !reason.trim()}
              startIcon={mutation.isPending ? <CircularProgress size={18} /> : null}
            >
              {mutation.isPending ? 'Rejeitando...' : 'Confirmar Rejeição'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
