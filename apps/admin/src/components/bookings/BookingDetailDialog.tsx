import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, Typography, Box, TextField,
  CircularProgress, Alert, IconButton,
} from '@mui/material';
import {
  CalendarTodayOutlined,
  AccessTimeOutlined,
  LocationOnOutlined,
  PersonOutlined,
  GroupOutlined,
  ArticleOutlined,
  InfoOutlined,
  Close,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import { BOOKINGS_ADMIN_QUERY_KEY } from '../../hooks/useBookingsAdmin';
import type { BookingAdminItem } from '../../hooks/useBookingsAdmin';

interface BookingDetailDialogProps {
  open: boolean;
  onClose: () => void;
  booking: BookingAdminItem | null;
}

type ActionMode = 'view' | 'rejecting';

const STATUS_BADGE: Record<string, { label: string; dot: string; bg: string; border: string; text: string }> = {
  pending:   { label: 'Aguardando',      dot: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  confirmed: { label: 'Confirmado',      dot: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  rejected:  { label: 'Rejeitado',       dot: '#ef4444', bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
  cancelled: { label: 'Cancelado',       dot: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6' },
  no_show:   { label: 'Não compareceu',  dot: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb', text: '#4b5563' },
};

const IconLabel: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <Typography sx={{
    fontSize: 12,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    mb: 0.75,
  }}>
    {icon}{children}
  </Typography>
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
        decision: { type: 'reject', reason: reason.trim() },
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

  const badge = STATUS_BADGE[booking.status] ?? { label: booking.status, dot: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb', text: '#4b5563' };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: { sx: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0,0,0,0.25)' } },
        paper: { sx: { borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } },
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5,
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'white',
      }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.01em' }}>
          Detalhes da Reserva
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f8fafc' } }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>

        {errorMsg && <Alert severity="error" sx={{ borderRadius: 2 }}>{errorMsg}</Alert>}

        {/* Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Status Atual
          </Typography>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 1.5, py: 0.75,
            bgcolor: badge.bg,
            border: `1px solid ${badge.border}`,
            borderRadius: 99,
          }}>
            <Box sx={{
              width: 8, height: 8, borderRadius: '50%', bgcolor: badge.dot,
              animation: 'statusPulse 2s infinite',
              '@keyframes statusPulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.35 },
              },
            }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: badge.text }}>
              {badge.label}
            </Typography>
          </Box>
        </Box>

        {/* Solicitante + Sala */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <Box>
            <IconLabel icon={<PersonOutlined sx={{ fontSize: 13 }} />}>Solicitante</IconLabel>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{booking.user.name}</Typography>
            <Typography sx={{ fontSize: 13, color: '#64748b' }}>{booking.user.email}</Typography>
          </Box>
          <Box>
            <IconLabel icon={<LocationOnOutlined sx={{ fontSize: 13 }} />}>Sala</IconLabel>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{booking.room.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <GroupOutlined sx={{ fontSize: 13, color: '#64748b' }} />
              <Typography sx={{ fontSize: 13, color: '#64748b' }}>Cap. {booking.room.capacity} pessoas</Typography>
            </Box>
          </Box>
        </Box>

        {/* Data + Horário */}
        <Box sx={{
          bgcolor: '#f8fafc',
          border: '1px solid #f1f5f9',
          borderRadius: 2.5,
          p: 2,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
        }}>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.75 }}>
              Data
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayOutlined sx={{ fontSize: 16, color: '#6366f1' }} />
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#334155', lineHeight: 1.3 }}>
                {fromDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.75 }}>
              Horário
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeOutlined sx={{ fontSize: 16, color: '#6366f1' }} />
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>
                {fromDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {' – '}
                {toDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Título + Descrição */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <IconLabel icon={<ArticleOutlined sx={{ fontSize: 13 }} />}>Título do Evento</IconLabel>
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#1e293b', lineHeight: 1.4 }}>
              {booking.title}
            </Typography>
          </Box>

          {booking.description && (
            <Box>
              <IconLabel icon={<InfoOutlined sx={{ fontSize: 13 }} />}>Descrição</IconLabel>
              <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, p: 1.5, bgcolor: 'white' }}>
                <Typography sx={{ fontSize: 14, color: '#475569', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{booking.description}"
                </Typography>
              </Box>
            </Box>
          )}

          {booking.rejectionCancelReason && (
            <Box sx={{ bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 1.5, p: 1.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                Motivo do cancelamento / rejeição
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#475569' }}>{booking.rejectionCancelReason}</Typography>
            </Box>
          )}
        </Box>

        {/* Campo de motivo (modo rejeição) */}
        {mode === 'rejecting' && (
          <TextField
            label={isPending ? 'Motivo da rejeição' : 'Motivo do cancelamento'}
            fullWidth
            multiline
            required
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
            helperText="Campo obrigatório"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        )}

        {/* Footer metadata */}
        <Box sx={{ pt: 2, borderTop: '1px solid #f1f5f9' }}>
          <Typography sx={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
            Solicitado originalmente em {new Date(booking.createdAt).toLocaleString('pt-BR')}
          </Typography>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{
        px: 3, py: 2.5,
        bgcolor: '#f8fafc',
        borderTop: '1px solid #f1f5f9',
        gap: 1.5,
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
      }}>
        {mode === 'view' && (
          <>
            {isPending && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setMode('rejecting')}
                  disabled={anyPending}
                  sx={{
                    fontSize: 14, fontWeight: 600,
                    color: '#e11d48', borderColor: '#fecdd3', bgcolor: 'white', borderRadius: 2,
                    '&:hover': { bgcolor: '#fff1f2', borderColor: '#fda4af' },
                  }}
                >
                  Rejeitar Reserva
                </Button>
                <Button
                  variant="contained"
                  onClick={() => confirmMutation.mutate()}
                  disabled={anyPending}
                  startIcon={anyPending ? <CircularProgress size={14} sx={{ color: 'white' }} /> : null}
                  sx={{
                    fontSize: 14, fontWeight: 600,
                    bgcolor: '#16a34a', color: 'white', borderRadius: 2,
                    boxShadow: '0 4px 6px -1px rgba(22,163,74,0.3)',
                    '&:hover': { bgcolor: '#15803d' },
                    '&:active': { transform: 'scale(0.97)' },
                  }}
                >
                  Confirmar Reserva
                </Button>
              </>
            )}

            {isConfirmed && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setMode('rejecting')}
                  disabled={anyPending}
                  sx={{
                    fontSize: 14, fontWeight: 600,
                    color: '#e11d48', borderColor: '#fecdd3', bgcolor: 'white', borderRadius: 2,
                    '&:hover': { bgcolor: '#fff1f2', borderColor: '#fda4af' },
                  }}
                >
                  Cancelar Reserva
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => noShowMutation.mutate()}
                  disabled={anyPending}
                  startIcon={anyPending ? <CircularProgress size={14} /> : null}
                  sx={{
                    fontSize: 14, fontWeight: 600,
                    color: '#d97706', borderColor: '#fde68a', bgcolor: 'white', borderRadius: 2,
                    '&:hover': { bgcolor: '#fffbeb', borderColor: '#fcd34d' },
                  }}
                >
                  {anyPending ? 'Salvando...' : 'Não compareceu'}
                </Button>
              </>
            )}
          </>
        )}

        {mode === 'rejecting' && (
          <>
            <Button
              onClick={() => { setMode('view'); setReason(''); }}
              disabled={anyPending}
              sx={{ color: '#64748b', fontSize: 14, fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: '#f1f5f9' } }}
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              onClick={() => rejectMutation.mutate()}
              disabled={anyPending || !reason.trim()}
              startIcon={anyPending ? <CircularProgress size={14} sx={{ color: 'white' }} /> : null}
              sx={{
                fontSize: 14, fontWeight: 600,
                bgcolor: '#dc2626', color: 'white', borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgba(220,38,38,0.25)',
                '&:hover': { bgcolor: '#b91c1c' },
                '&.Mui-disabled': { bgcolor: '#fca5a5', color: 'white' },
              }}
            >
              {anyPending ? 'Salvando...' : isPending ? 'Confirmar Rejeição' : 'Confirmar Cancelamento'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
