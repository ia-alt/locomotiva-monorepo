import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import type { Room } from './RoomCard';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'Monday', label: 'Segunda-feira' },
  { key: 'Tuesday', label: 'Terça-feira' },
  { key: 'Wednesday', label: 'Quarta-feira' },
  { key: 'Thursday', label: 'Quinta-feira' },
  { key: 'Friday', label: 'Sexta-feira' },
  { key: 'Saturday', label: 'Sábado' },
  { key: 'Sunday', label: 'Domingo' },
];

type TimeInterval = { start: string; end: string };

type DaySchedule = {
  enabled: boolean;
  intervals: TimeInterval[];
};

type ScheduleState = Record<DayOfWeek, DaySchedule>;

function defaultSchedule(): ScheduleState {
  return Object.fromEntries(
    DAYS.map(({ key }) => [key, { enabled: false, intervals: [{ start: '08:00', end: '18:00' }] }])
  ) as ScheduleState;
}

function parseTime(timeStr: string): { hour: number; minute: number; second: number } {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute, second: 0 };
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Converte o JSON da API (política mais recente) para o estado do formulário
function scheduleFromApiResponse(data: {
  policies: Array<{
    weeklySchedule: Partial<Record<DayOfWeek, { intervals: Array<{ start: { hour: number; minute: number }; end: { hour: number; minute: number } }> } | null>>;
  }>;
} | null): ScheduleState {
  const base = defaultSchedule();

  if (!data || data.policies.length === 0) return base;

  // Pega a política mais recente (última da lista, já ordenada pelo backend)
  const latestPolicy = data.policies.at(-1)!;
  const weekly = latestPolicy.weeklySchedule;

  for (const { key } of DAYS) {
    const dayData = weekly[key];
    if (dayData === null || dayData === undefined) {
      base[key] = { enabled: false, intervals: [{ start: '08:00', end: '18:00' }] };
    } else {
      base[key] = {
        enabled: true,
        intervals: dayData.intervals.map((iv) => ({
          start: formatTime(iv.start.hour, iv.start.minute),
          end: formatTime(iv.end.hour, iv.end.minute),
        })),
      };
    }
  }

  return base;
}

interface OperatingHoursDialogProps {
  open: boolean;
  onClose: () => void;
  room: Room | null;
  onSave?: () => void;
}

export const OperatingHoursDialog: React.FC<OperatingHoursDialogProps> = ({ open, onClose, room, onSave }) => {
  const [schedule, setSchedule] = useState<ScheduleState>(defaultSchedule);
  const [error, setError] = useState<string | null>(null);

  // Busca os horários salvos quando o dialog abre
  const { data: savedSchedule, isLoading } = useQuery({
    queryKey: ['room-operating-schedule', room?.id],
    queryFn: () => orpc.booking.getRoomOperatingSchedule({ roomId: room!.id }),
    enabled: open && !!room,
  });

  // Popula o formulário com os dados salvos assim que chegam
  useEffect(() => {
    if (savedSchedule !== undefined) {
      setSchedule(scheduleFromApiResponse(savedSchedule as Parameters<typeof scheduleFromApiResponse>[0]));
    }
  }, [savedSchedule]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!room) return;

      const weeklySchedule = Object.fromEntries(
        DAYS.map(({ key }) => {
          const day = schedule[key];
          return [
            key,
            day.enabled
              ? { intervals: day.intervals.map((iv) => ({ start: parseTime(iv.start), end: parseTime(iv.end) })) }
              : null,
          ];
        })
      );

      const today = new Date().toISOString().split('T')[0];

      await orpc.booking.setDefaultOperatingSchedule({
        roomId: room.id,
        policy: { weeklySchedule, effectiveFrom: today },
      });
    },
    onSuccess: () => {
      setError(null);
      onSave?.();
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Falha ao salvar horários');
    },
  });

  const handleDayToggle = (day: DayOfWeek, enabled: boolean) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], enabled } }));
  };

  const handleIntervalChange = (day: DayOfWeek, index: number, field: 'start' | 'end', value: string) => {
    setSchedule((prev) => {
      const intervals = prev[day].intervals.map((iv, i) =>
        i === index ? { ...iv, [field]: value } : iv
      );
      return { ...prev, [day]: { ...prev[day], intervals } };
    });
  };

  const handleAddInterval = (day: DayOfWeek) => {
    setSchedule((prev) => {
      const lastEnd = prev[day].intervals.at(-1)?.end ?? '12:00';
      return {
        ...prev,
        [day]: {
          ...prev[day],
          intervals: [...prev[day].intervals, { start: lastEnd, end: '18:00' }],
        },
      };
    });
  };

  const handleRemoveInterval = (day: DayOfWeek, index: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        intervals: prev[day].intervals.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: { sx: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0, 0, 0, 0.2)' } },
        paper: { sx: { borderRadius: 2 } },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Horários de Funcionamento
        {room && (
          <Typography variant="body2" color="text.secondary">
            {room.name}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

            {DAYS.map(({ key, label }, index) => {
              const day = schedule[key];
              return (
                <React.Fragment key={key}>
                  {index > 0 && <Divider />}
                  <Box sx={{ py: 0.75 }}>
                    {/* Linha do toggle + label */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={day.enabled}
                            onChange={(e) => handleDayToggle(key, e.target.checked)}
                            size="small"
                            color="success"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ width: 115 }}>
                            {label}
                          </Typography>
                        }
                        labelPlacement="end"
                        sx={{ m: 0, minWidth: 175 }}
                      />
                      {!day.enabled && (
                        <Typography variant="body2" color="text.disabled">
                          Fechado
                        </Typography>
                      )}
                    </Box>

                    {/* Intervalos de horário */}
                    {day.enabled && (
                      <Box sx={{ ml: '175px', mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {day.intervals.map((iv, ivIndex) => (
                          <Box key={ivIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              type="time"
                              value={iv.start}
                              onChange={(e) => handleIntervalChange(key, ivIndex, 'start', e.target.value)}
                              size="small"
                              sx={{ width: 120 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              até
                            </Typography>
                            <TextField
                              type="time"
                              value={iv.end}
                              onChange={(e) => handleIntervalChange(key, ivIndex, 'end', e.target.value)}
                              size="small"
                              sx={{ width: 120 }}
                            />
                            {ivIndex > 0 && (
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveInterval(key, ivIndex)}
                                color="error"
                                aria-label="remover intervalo"
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        ))}

                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddInterval(key)}
                          sx={{ alignSelf: 'flex-start', mt: 0.25, fontSize: '0.75rem' }}
                        >
                          Adicionar pausa
                        </Button>
                      </Box>
                    )}
                  </Box>
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={() => mutation.mutate()}
          variant="contained"
          color="primary"
          disabled={mutation.isPending || isLoading}
          startIcon={mutation.isPending ? <CircularProgress size={20} /> : null}
        >
          {mutation.isPending ? 'Salvando...' : 'Salvar Horários'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
