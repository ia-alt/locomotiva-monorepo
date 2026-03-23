import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DAY_NAMES = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

interface MonthCalendarProps {
  year: number;
  month: number; // 1-12
  blockedDates: Set<string>;
  onToggleDate: (dateKey: string) => void;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ year, month, blockedDates, onToggleDate }) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <Box>
      <Typography variant="subtitle2" align="center" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
        {MONTH_NAMES[month - 1]}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {DAY_NAMES.map((d, i) => (
          <Typography
            key={i}
            variant="caption"
            align="center"
            sx={{ color: 'text.disabled', fontWeight: 'bold', fontSize: '0.65rem', py: '2px' }}
          >
            {d}
          </Typography>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return <Box key={`empty-${idx}`} />;
          }
          const dateKey = toDateKey(year, month, day);
          const isBlocked = blockedDates.has(dateKey);
          const isToday = dateKey === todayKey;

          return (
            <Tooltip key={dateKey} title={isBlocked ? 'Clique para desbloquear' : 'Clique para bloquear'} arrow>
              <Box
                onClick={() => onToggleDate(dateKey)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: isToday ? 'bold' : 'normal',
                  bgcolor: isBlocked ? 'error.main' : isToday ? 'primary.light' : 'transparent',
                  color: isBlocked ? 'white' : isToday ? 'white' : 'text.primary',
                  border: isToday && !isBlocked ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isBlocked ? 'error.dark' : 'action.hover',
                  },
                }}
              >
                {day}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

interface GlobalRestrictionsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const GlobalRestrictionsDialog: React.FC<GlobalRestrictionsDialogProps> = ({ open, onClose }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['globalBlockedDates'],
    queryFn: () => orpc.booking.getGlobalBlockedDates({}),
    enabled: open,
  });

  useEffect(() => {
    if (data) {
      setBlockedDates(new Set(data.dates));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (dates: string[]) => orpc.booking.setGlobalBlockedDates({ dates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalBlockedDates'] });
      onClose();
    },
    onError: (err) => {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar restrições.');
    },
  });

  const handleToggleDate = (dateKey: string) => {
    setBlockedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  const handleSave = () => {
    setSaveError(null);
    mutation.mutate(Array.from(blockedDates));
  };

  const handleClose = () => {
    setSaveError(null);
    if (data) setBlockedDates(new Set(data.dates));
    onClose();
  };

  const blockedCount = Array.from(blockedDates).filter(d => d.startsWith(`${year}-`)).length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0,0,0,0.2)' },
        },
        paper: { sx: { borderRadius: 2 } },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BlockIcon color="error" />
          Restrições Globais — Feriados e Dias Bloqueados
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'normal', mt: 0.5 }}>
          Dias selecionados ficam bloqueados para todas as salas. Clique num dia para bloquear ou desbloquear.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

        {/* Navegação de ano */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => setYear(y => y - 1)} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{year}</Typography>
            {blockedCount > 0 && (
              <Chip
                label={`${blockedCount} dia${blockedCount > 1 ? 's' : ''} bloqueado${blockedCount > 1 ? 's' : ''}`}
                color="error"
                size="small"
              />
            )}
          </Box>
          <IconButton onClick={() => setYear(y => y + 1)} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <Box
                key={month}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <MonthCalendar
                  year={year}
                  month={month}
                  blockedDates={blockedDates}
                  onToggleDate={handleToggleDate}
                />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Total bloqueado: {blockedDates.size} dia{blockedDates.size !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSave}
          disabled={mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={20} /> : null}
        >
          {mutation.isPending ? 'Salvando...' : 'Salvar Restrições'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
