import React, { useMemo } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../services/api';

interface AvailabilityTimelineProps {
  roomId: string;
  date: string; // YYYY-MM-DD
  onSelectBlock?: (from: Date, to: Date) => void;
}

const START_HOUR = 8;
const END_HOUR = 18;
const PIXELS_PER_MINUTE = 2.5; // Width scale (1 hour = 150px)
const HOUR_WIDTH = 60 * PIXELS_PER_MINUTE;

type Block = {
  id: string;
  type: 'free' | 'occupied';
  startMin: number;
  endMin: number;
  startOrigin?: Date;
  endOrigin?: Date;
  label?: string;
};

export const AvailabilityTimeline: React.FC<AvailabilityTimelineProps> = ({ roomId, date, onSelectBlock }) => {
  const { data: routeData, isLoading } = useQuery({
    queryKey: ['booking', 'availableSlots', roomId, date],
    queryFn: () => orpc.booking.listAvailableSlotsByDay({ roomId, day: date }),
    enabled: !!roomId && !!date,
  });

  const blocks = useMemo(() => {
    if (!routeData?.slots) return [];

    const START_MINS = START_HOUR * 60;
    const END_MINS = END_HOUR * 60;

    const freeSlots = routeData.slots.map((s: any) => {
      const startOrigin = new Date(s.from);
      const endOrigin = new Date(s.to);
      let sMin = startOrigin.getHours() * 60 + startOrigin.getMinutes();
      let eMin = endOrigin.getHours() * 60 + endOrigin.getMinutes();

      if (eMin === 0 && startOrigin.getDay() !== endOrigin.getDay()) {
        eMin = 24 * 60;
      }

      return { sMin, eMin, startOrigin, endOrigin };
    });

    freeSlots.sort((a: any, b: any) => a.sMin - b.sMin);

    const clippedFreeSlots = [];
    for (const slot of freeSlots) {
      const sMin = Math.max(START_MINS, slot.sMin);
      const eMin = Math.min(END_MINS, slot.eMin);
      if (sMin < eMin) {
        clippedFreeSlots.push({ sMin, eMin, startOrigin: slot.startOrigin, endOrigin: slot.endOrigin });
      }
    }

    const timelineBlocks: Block[] = [];
    let curMin = START_MINS;

    clippedFreeSlots.forEach((slot, idx) => {
      if (slot.sMin > curMin) {
        timelineBlocks.push({
          id: `occupied-${idx}`,
          type: 'occupied',
          startMin: curMin,
          endMin: slot.sMin,
          label: ''
        });
      }
      timelineBlocks.push({
        id: `free-${idx}`,
        type: 'free',
        startMin: slot.sMin,
        endMin: slot.eMin,
        startOrigin: slot.startOrigin,
        endOrigin: slot.endOrigin,
        label: 'LIVRE'
      });
      curMin = slot.eMin;
    });

    if (curMin < END_MINS) {
      timelineBlocks.push({
        id: `occupied-end`,
        type: 'occupied',
        startMin: curMin,
        endMin: END_MINS,
        label: ''
      });
    }

    return timelineBlocks;
  }, [routeData]);

  const hoursGrid = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  if (!roomId || !date) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Disponibilidade</Typography>
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography color="text.secondary" variant="body2">Selecione uma sala e uma data primeiro.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Disponibilidade</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Selecione um bloco de tempo disponível para preencher os horários:
      </Typography>

      <Paper 
        variant="outlined" 
        sx={{ 
          height: 140, 
          position: 'relative', 
          overflowX: 'auto', 
          overflowY: 'hidden',
          borderRadius: 2,
          bgcolor: 'white'
        }}
      >
        {isLoading && (
          <Box 
            sx={{ 
              position: 'absolute', inset: 0, 
              bgcolor: 'rgba(255,255,255,0.8)', zIndex: 10,
              display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center' 
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>Buscando horários...</Typography>
          </Box>
        )}

        <Box sx={{ minWidth: (END_HOUR - START_HOUR) * HOUR_WIDTH, height: '100%', position: 'relative' }}>
          {/* Grid lines */}
          <Box sx={{ position: 'absolute', inset: 0 }}>
            {hoursGrid.map((h) => (
              <Box 
                key={h} 
                sx={{ 
                  position: 'absolute', top: 0, bottom: 0, 
                  width: 1, bgcolor: 'grey.200', 
                  left: (h - START_HOUR) * HOUR_WIDTH,
                  display: 'flex', alignItems: 'flex-end', pb: 1, pl: 0.5
                }}
              >
                <Typography variant="caption" sx={{ fontSize: 10, color: 'grey.500', width: 30 }}>
                  {h.toString().padStart(2, '0')}H
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Blocks */}
          <Box sx={{ position: 'absolute', top: 16, height: 80, left: 0, right: 0 }}>
            {blocks.map((b) => {
              const leftPos = (b.startMin - (START_HOUR * 60)) * PIXELS_PER_MINUTE;
              const widthPx = (b.endMin - b.startMin) * PIXELS_PER_MINUTE;
              const isFree = b.type === 'free';

              return (
                <Box
                  key={b.id}
                  onClick={() => {
                    if (isFree && onSelectBlock && b.startOrigin && b.endOrigin) {
                      onSelectBlock(b.startOrigin, b.endOrigin);
                    }
                  }}
                  sx={{
                    position: 'absolute', top: 0, bottom: 0,
                    left: leftPos, width: widthPx,
                    cursor: isFree ? 'pointer' : 'default',
                    opacity: isFree ? 1 : 0.8,
                    p: 0.5, // spacing between blocks
                    boxSizing: 'border-box'
                  }}
                >
                  <Paper
                    elevation={isFree ? 2 : 0}
                    sx={{
                      height: '100%',
                      bgcolor: isFree ? '#E0F2FE' : '#F3F4F6',
                      border: 1,
                      borderColor: isFree ? '#BAE6FD' : 'transparent',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'center',
                      p: 1,
                      transition: 'all 0.2s',
                      '&:hover': isFree ? { bgcolor: '#bae6fd', borderColor: '#7dd3fc' } : {}
                    }}
                  >
                    <Typography 
                      sx={{ 
                        fontSize: 10, fontWeight: 'bold', 
                        color: isFree ? '#0284C7' : 'grey.500' 
                      }}
                    >
                      {b.label}
                    </Typography>
                    {isFree && (
                      <Typography sx={{ fontSize: 11, fontWeight: 'bold', color: '#0284C7' }}>
                        {(b.endMin - b.startMin) / 60}h
                      </Typography>
                    )}
                  </Paper>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
