import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Divider, TextField,
  CircularProgress, Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import { BOOKINGS_ADMIN_QUERY_KEY } from '../../hooks/useBookingsAdmin';
import { BookingStatusChip } from './BookingStatusChip';
import type { BookingAdminItem } from '../../hooks/useBookingsAdmin';

interface BookingDetailDialogProps {
  open: boolean;
  onClose: () => void;
  booking: BookingAdminItem | null;
}

type ActionMode = 'view' | 'rejecting';

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Box sx={{ mt: 0.25 }}>{value}</Box>
  </Box>
);

export const BookingDetailDialog: React.FC<BookingDetailDialogProps> = ({ open, onClose, booking }) => {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<ActionMode>('view');
  const [reason, setReason] = useState('');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: BOOKINGS_ADMIN_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ['booking', 'calendar'] });
  };

  const confirmMutation = useMutation({
    mutationFn: () =>
      orpc.booking.processBookingRequest({ bookingId: booking!.id, decision: { type: 'confirm' } }),
    onSuccess: () => { invalidate(); handleClose(); },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      orpc.booking.processBookingRequest({
        bookingId: booking!.id,
        decision: { type: 'reject', reason: reason.trim() || undefined },
      }),
    onSuccess: () => { invalidate(); handleClose(); },
  });

  const noShowMutation = useMutation({
    mutationFn: () =>
      orpc.booking.markBookingNoShow({ bookingId: booking!.id }),
    onSuccess: () => { invalidate(); handleClose(); },
  });

  const handleClose = () => {
    setMode('view');
    setReason('');
    onClose();
  };

  if (!booking) return null;

  const fromDate = new Date(booking.period.from);
  const toDate = new Date(booking.period.to);
  const isPending = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';

  const anyPending =
    confirmMutation.isPending ||
    rejectMutation.isPending ||
    noShowMutation.isPending;

  const mutationError =
    confirmMutation.error || rejectMutation.error || noShowMutation.error;
  const errorMsg = mutationError instanceof Error ? mutationError.message : null;

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
      <DialogTitle sx={{ fontWeight: 'bold' }}>Detalhes da Reserva</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          {/* Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Status:</Typography>
            <BookingStatusChip status={booking.status} />
          </Box>

          <Divider />

          {/* Solicitante */}
          <DetailRow label="Solicitante" value={
            <Box>
              <Typography variant="body1" fontWeight={500}>{booking.user.name}</Typography>
              <Typography variant="body2" color="text.secondary">{booking.user.email}</Typography>
            </Box>
          } />

          {/* Sala + Data */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <DetailRow label="Sala" value={
              <Box>
                <Typography variant="body1" fontWeight={500}>{booking.room.name}</Typography>
                <Typography variant="body2" color="text.secondary">Cap. {booking.room.capacity}</Typography>
              </Box>
            } />
            <DetailRow label="Data" value={
              <Typography variant="body1">
                {fromDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            } />
          </Box>

          {/* Horário */}
          <DetailRow label="Horário" value={
            <Typography variant="body1">
              {fromDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              {' – '}
              {toDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          } />

          <DetailRow label="Título" value={<Typography variant="body1" fontWeight={500}>{booking.title}</Typography>} />

          {booking.description && (
            <DetailRow label="Finalidade" value={<Typography variant="body1">{booking.description}</Typography>} />
          )}

          {booking.rejectionCancelReason && (
            <Box sx={{ bgcolor: '#fff5f5', border: '1px solid #fecaca', borderRadius: 1, p: 1.5 }}>
              <Typography variant="caption" color="error.main" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Motivo do cancelamento / rejeição
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.25 }}>{booking.rejectionCancelReason}</Typography>
            </Box>
          )}

          <Divider />

          <DetailRow label="Solicitado em" value={
            <Typography variant="body2" color="text.secondary">
              {new Date(booking.createdAt).toLocaleString('pt-BR')}
            </Typography>
          } />

          {/* Ação: Rejeitar / Cancelar — campo de motivo */}
          {mode === 'rejecting' && (
            <TextField
              label={isPending ? 'Motivo da rejeição (opcional)' : 'Motivo do cancelamento (opcional)'}
              fullWidth
              multiline
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          )}

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {/* View mode */}
        {mode === 'view' && (
          <>
            <Button onClick={handleClose} color="inherit" disabled={anyPending}>Fechar</Button>

            {/* Pending actions */}
            {isPending && (
              <>
                <Button variant="outlined" color="error" onClick={() => setMode('rejecting')} disabled={anyPending}>
                  Rejeitar
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => confirmMutation.mutate()}
                  disabled={anyPending}
                  startIcon={anyPending ? <CircularProgress size={16} /> : null}
                >
                  Confirmar
                </Button>
              </>
            )}

            {/* Confirmed actions */}
            {isConfirmed && (
              <>
                <Button variant="outlined" color="error" onClick={() => setMode('rejecting')} disabled={anyPending}>
                  Cancelar
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => noShowMutation.mutate()}
                  disabled={anyPending}
                  startIcon={anyPending ? <CircularProgress size={16} /> : null}
                >
                  {anyPending ? 'Salvando...' : 'Não compareceu'}
                </Button>
              </>
            )}
          </>
        )}

        {/* Rejecting mode */}
        {mode === 'rejecting' && (
          <>
            <Button onClick={() => { setMode('view'); setReason(''); }} color="inherit" disabled={anyPending}>
              Voltar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => rejectMutation.mutate()}
              disabled={anyPending}
              startIcon={anyPending ? <CircularProgress size={16} /> : null}
            >
              {anyPending ? 'Salvando...' : isPending ? 'Confirmar Rejeição' : 'Confirmar Cancelamento'}
            </Button>
          </>
        )}

      </DialogActions>
    </Dialog>
  );
};
