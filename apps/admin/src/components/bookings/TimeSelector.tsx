import { useEffect } from 'react';
import {
  Box,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import type { AvailabilityTimelineSlot } from './AvailabilityTimeline';

interface TimeSelectorProps {
  timeSlot: AvailabilityTimelineSlot | null;
  isLoading: boolean;
  startTime: string | null;
  endTime: string | null;
  onChangeStart: (time: string | null) => void;
  onChangeEnd: (time: string | null) => void;
}

export default function TimeSelector({
  isLoading: isLoading, timeSlot, onChangeStart, onChangeEnd, startTime, endTime
}: TimeSelectorProps) {
  const enabled = !!timeSlot;
  const hasError = !!(startTime && endTime && new Date(endTime).getTime() <= new Date(startTime).getTime());

  useEffect(() => {
    onChangeStart(null);
    onChangeEnd(null);
  }, [timeSlot]);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        2. Ajuste o Horário da Reserva
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              error={hasError}
              disabled={!enabled}
              label="Horário de início"
              type="time"
              fullWidth
              required
              value={startTime}
              onChange={(e) => onChangeStart(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              error={hasError}
              disabled={!enabled || !startTime}
              label="Horário de término"
              type="time"
              fullWidth
              required
              value={endTime}
              onChange={(e) => onChangeEnd(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
