import React, { useState, useMemo } from 'react';
import {
  Box, Typography, IconButton, Checkbox, FormControlLabel,
  CircularProgress, Divider,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import type { BookingAdminItem } from '../../hooks/useBookingsAdmin';

const ROOM_COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#22c55e', '#ef4444', '#06b6d4', '#eab308'];
const WEEK_DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function toLocalDateStr(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

interface BookingCalendarProps {
  onViewBooking: (booking: BookingAdminItem) => void;
}

type RoomItem = { id: string; name: string; enabled: boolean };

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ onViewBooking }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  // null = all rooms visible; string[] = only these rooms
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[] | null>(null);

  const { data: roomsRaw = [] } = useQuery({
    queryKey: ['booking', 'rooms'],
    queryFn: () => orpc.booking.listRooms({}),
    staleTime: 5 * 60_000,
  });
  const rooms = roomsRaw as RoomItem[];

  const roomColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    rooms.forEach((room, i) => { map[room.id] = ROOM_COLORS[i % ROOM_COLORS.length]; });
    return map;
  }, [rooms]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const dateFrom = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`;
  const dateTo = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['booking', 'calendar', viewYear, viewMonth],
    queryFn: () =>
      orpc.booking.findBookingsAdmin({
        pagination: { pageNumber: 1, pageSize: 500 },
        filter: { dateFrom, dateTo, status: ['confirmed'] },
      }),
    staleTime: 30_000,
  });

  const allBookings = (bookingsData?.items ?? []) as BookingAdminItem[];

  const visibleBookings = useMemo(() => {
    if (!selectedRoomIds) return allBookings;
    return allBookings.filter((b) => selectedRoomIds.includes(b.room.id));
  }, [allBookings, selectedRoomIds]);

  const bookingsByDay = useMemo(() => {
    const map: Record<string, BookingAdminItem[]> = {};
    visibleBookings.forEach((b) => {
      const key = toLocalDateStr(new Date(b.period.from));
      (map[key] ??= []).push(b);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => new Date(a.period.from).getTime() - new Date(b.period.from).getTime())
    );
    return map;
  }, [visibleBookings]);

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const weeks = Math.ceil((firstDow + daysInMonth) / 7);
  const totalCells = weeks * 7;
  const calendarDays = Array.from({ length: totalCells }, (_, i) =>
    new Date(viewYear, viewMonth, 1 - firstDow + i)
  );

  const todayStr = toLocalDateStr(today);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const isRoomChecked = (roomId: string) =>
    selectedRoomIds === null || selectedRoomIds.includes(roomId);

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds((prev) => {
      if (prev === null) {
        const next = rooms.filter((r) => r.id !== roomId).map((r) => r.id);
        return next.length === 0 ? null : next;
      }
      const next = prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId];
      return next.length === rooms.length ? null : next;
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 600 }}>
      {/* Sidebar */}
      <Box sx={{ width: 260, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', p: 2.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Mês e Ano
        </Typography>
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          mt: 1, mb: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, px: 0.5,
        }}>
          <IconButton size="small" onClick={prevMonth}><ChevronLeft fontSize="small" /></IconButton>
          <Typography variant="body2" fontWeight={600} noWrap>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Typography>
          <IconButton size="small" onClick={nextMonth}><ChevronRight fontSize="small" /></IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Filtro de Salas
        </Typography>

        <Box sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={selectedRoomIds === null}
                onChange={() => { if (selectedRoomIds !== null) setSelectedRoomIds(null); }}
                color="primary"
              />
            }
            label={<Typography variant="body2" fontWeight={500}>Todas as Salas</Typography>}
          />
          <Divider sx={{ my: 1 }} />
          {rooms.map((room, i) => {
            const color = ROOM_COLORS[i % ROOM_COLORS.length];
            const checked = isRoomChecked(room.id);
            return (
              <FormControlLabel
                key={room.id}
                control={
                  <Checkbox
                    size="small"
                    checked={checked}
                    onChange={() => toggleRoom(room.id)}
                    sx={{ color, '&.Mui-checked': { color } }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                    <Typography variant="body2">{room.name}</Typography>
                  </Box>
                }
              />
            );
          })}
        </Box>
      </Box>

      {/* Calendar grid */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Day headers */}
            {WEEK_DAYS.map((d, i) => (
              <Box key={d} sx={{
                py: 1.5, textAlign: 'center',
                borderBottom: '1px solid',
                borderRight: i < 6 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: 0.5 }}>
                  {d}
                </Typography>
              </Box>
            ))}

            {/* Day cells */}
            {calendarDays.map((date, i) => {
              const isCurrentMonth = date.getMonth() === viewMonth;
              const dateStr = toLocalDateStr(date);
              const isToday = dateStr === todayStr;
              const dayBookings = bookingsByDay[dateStr] ?? [];
              const isLastCol = i % 7 === 6;
              const isLastRow = i >= totalCells - 7;

              return (
                <Box key={i} sx={{
                  minHeight: 100,
                  p: 0.75,
                  borderBottom: isLastRow ? 'none' : '1px solid',
                  borderRight: isLastCol ? 'none' : '1px solid',
                  borderColor: 'divider',
                  bgcolor: isCurrentMonth ? 'background.paper' : 'grey.50',
                }}>
                  <Box sx={{ mb: 0.5 }}>
                    {isToday ? (
                      <Box sx={{
                        width: 26, height: 26, borderRadius: '50%',
                        bgcolor: 'primary.main', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        {date.getDate()}
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{
                        fontWeight: 500,
                        color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 26, height: 26,
                      }}>
                        {date.getDate()}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {dayBookings.map((booking) => {
                      const color = roomColorMap[booking.room.id] ?? '#94a3b8';
                      const hour = new Date(booking.period.from).toLocaleTimeString('pt-BR', {
                        hour: '2-digit', minute: '2-digit',
                      });
                      return (
                        <Box
                          key={booking.id}
                          onClick={() => onViewBooking(booking)}
                          sx={{
                            bgcolor: `${color}20`,
                            borderLeft: `3px solid ${color}`,
                            borderRadius: '0 4px 4px 0',
                            px: 0.75, py: 0.3,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            '&:hover': { bgcolor: `${color}40` },
                          }}
                        >
                          <Typography variant="caption" noWrap sx={{
                            color, fontWeight: 600, fontSize: '0.7rem', display: 'block',
                          }}>
                            {booking.room.name} · {hour}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};
