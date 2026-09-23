import { useMemo } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CircularProgress,
  Typography,
} from '@mui/material';
import { onlyTimeObjToTimeStr } from '../../utils/datetime-formatters';
import type { ORPCOutputs } from '../../services/types';

type AvailableSlots = ORPCOutputs['booking']['listAvailableSlotsByDay']['slots'];
export type AvailabilityTimelineSlot = AvailableSlots[0];

interface AvailabilityTimelineProps {
    availableSlots?: AvailableSlots;
    isLoadingSlots: boolean;
    selectedSlot: AvailabilityTimelineSlot | null;
    setSelectedSlot: (slot: AvailabilityTimelineSlot | null) => void;
}

export default function AvailabilityTimeline({
isLoadingSlots: isLoading, selectedSlot, setSelectedSlot, availableSlots
}: AvailabilityTimelineProps) {
    const blockWithLabel = useMemo(() => {
    if (!availableSlots?.length) return [];

    function hourToLabel(hour: number): string {
      if (hour >= 6 && hour < 12) return 'Manhã';
      if (hour >= 12 && hour <= 18) return 'Tarde';
      if (hour > 18 && hour < 24) return 'Noite';
      return '';
    }

    return availableSlots.map((slot) => {
      const startLabel = hourToLabel(slot.start.hour);
      const endLabel = hourToLabel(slot.end.hour);
      const combinedLabel = startLabel === endLabel ? startLabel : `${startLabel} & ${endLabel}`;

      return {
        slot,
        label: combinedLabel,
      };
    });
  }, [availableSlots]);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        1. Escolha um período
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          {blockWithLabel.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Depois de escolher o período, você poderá ajustar o horário de início e fim da reserva.
            </Typography>
          )}

          {blockWithLabel.length === 0 ? (
            <Box sx={{ bgcolor: 'primary.50', borderRadius: 1, p: 1.5 }}>
              <Typography variant="body2" color="primary.700" sx={{ fontWeight: 500 }}>
                Nenhum horário disponível para o dia selecionado.{' '}
                <Box component="span" sx={{ fontWeight: 700 }}>
                  Tente outro dia
                </Box>
                .
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
              }}
            >
              {blockWithLabel.map(({ slot, label }) => {
                const isSelected =
                  selectedSlot &&
                  selectedSlot.start.hour === slot.start.hour &&
                  selectedSlot.start.minute === slot.start.minute &&
                  selectedSlot.start.second === slot.start.second;

                return (
                  <Card
                    key={`${slot.start.hour}:${slot.start.minute}-${slot.end.hour}:${slot.end.minute}`}
                    variant="outlined"
                    sx={{
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'primary.50' : 'background.paper',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <CardActionArea onClick={() => setSelectedSlot(slot)} sx={{ p: 2, height: '100%' }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {label}
                      </Typography>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{ mt: 0.5, fontWeight: 700, color: isSelected ? 'primary.main' : 'text.primary' }}
                      >
                        {onlyTimeObjToTimeStr(slot.start)} - {onlyTimeObjToTimeStr(slot.end)}
                      </Typography>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
