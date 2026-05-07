import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, TextField, InputAdornment,
  CircularProgress, Alert, Pagination, IconButton, Tooltip,
  Tabs, Tab, Badge, Popover, FormGroup, FormControlLabel, Checkbox,
  Select, MenuItem, Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  CalendarMonth as CalendarMonthIcon,
  FormatListBulleted as ListIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { orpc } from '../services/api';
import { useBookingsAdmin } from '../hooks/useBookingsAdmin';
import { BookingStatusChip } from '../components/bookings/BookingStatusChip';
import { BookingViewModal } from '../components/bookings/BookingViewModal';
import { CreateBookingDialog } from '../components/bookings/CreateBookingDialog';
import { BookingCalendar } from '../components/bookings/BookingCalendar';

const PAGE_SIZE = 5;

const STATUS_FILTER_OPTIONS = [
  { value: 'pending', label: 'Aguardando' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'rejected', label: 'Rejeitado' },
  { value: 'no_show', label: 'Não compareceu' },
];

function formatDateRange(from: string, to: string) {
  const f = new Date(from);
  const t = new Date(to);
  return {
    date: f.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: `${f.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} – ${t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
  };
}

const BookingsPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Filter popover state
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<string[]>([]);
  const [pendingDateFrom, setPendingDateFrom] = useState('');
  const [pendingDateTo, setPendingDateTo] = useState('');
  const [pendingRoomId, setPendingRoomId] = useState('');

  // Applied filters (only after "Aplicar")
  const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [appliedRoomId, setAppliedRoomId] = useState('');

  const [_searchParams, setSearchParams] = useSearchParams();

  const handleOpenBooking = (id: string) => {
    setSearchParams((prev) => {
      prev.set('view', id);
      return prev;
    }, { replace: true });
  };

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Pending count for badge (no filters)
  const { data: pendingData } = useQuery({
    queryKey: ['booking', 'admin-pending-count'],
    queryFn: () =>
      orpc.booking.findBookingsAdmin({
        pagination: { pageNumber: 1, pageSize: 1 },
        filter: { status: ['pending'] },
      }),
    staleTime: 30_000,
  });
  const pendingCount = pendingData?.total ?? 0;

  // Rooms for filter dropdown
  const { data: roomsData } = useQuery({
    queryKey: ['booking', 'rooms'],
    queryFn: () => orpc.booking.listRooms({}),
    staleTime: 5 * 60_000,
  });
  const rooms = (roomsData ?? []) as { id: string; name: string; enabled: boolean }[];

  const { bookings, pagesCount, isLoading, isError, error } = useBookingsAdmin({
    page,
    pageSize: PAGE_SIZE,
    statusFilter: appliedStatuses.length ? appliedStatuses : undefined,
    roomIdFilter: appliedRoomId || undefined,
    search: search || undefined,
    dateFrom: appliedDateFrom || undefined,
    dateTo: appliedDateTo || undefined,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openFilter = (e: React.MouseEvent<HTMLElement>) => {
    // Sync pending state with applied
    setPendingStatuses(appliedStatuses);
    setPendingDateFrom(appliedDateFrom);
    setPendingDateTo(appliedDateTo);
    setPendingRoomId(appliedRoomId);
    setFilterAnchor(e.currentTarget);
  };

  const applyFilters = () => {
    setAppliedStatuses(pendingStatuses);
    setAppliedDateFrom(pendingDateFrom);
    setAppliedDateTo(pendingDateTo);
    setAppliedRoomId(pendingRoomId);
    setPage(1);
    setFilterAnchor(null);
  };

  const clearFilters = () => {
    setPendingStatuses([]);
    setPendingDateFrom('');
    setPendingDateTo('');
    setPendingRoomId('');
  };

  const toggleStatus = (value: string) => {
    setPendingStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const hasActiveFilters =
    appliedStatuses.length > 0 || appliedDateFrom || appliedDateTo || appliedRoomId;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Gestão de Reservas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie as solicitações e a disponibilidade de espaços no Hub.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ whiteSpace: 'nowrap' }}
          onClick={() => setIsCreateOpen(true)}
        >
          Nova Reserva
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ListIcon fontSize="small" />
                  Solicitações
                  {pendingCount > 0 && (
                    <Badge badgeContent={pendingCount} color="warning" sx={{ ml: 0.5 }} />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonthIcon fontSize="small" />
                  Calendário
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* Tab: Solicitações */}
        {tab === 0 && (
          <>
            {/* Filters bar */}
            <Box sx={{ display: 'flex', gap: 1.5, p: 2, alignItems: 'center' }}>
              <TextField
                sx={{ flexGrow: 1 }}
                size="small"
                placeholder="Buscar por solicitante, sala ou finalidade..."
                value={search}
                onChange={handleSearchChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Tooltip title={hasActiveFilters ? 'Filtros ativos' : 'Filtrar'}>
                <IconButton
                  onClick={openFilter}
                  sx={{
                    border: '1px solid',
                    borderColor: hasActiveFilters ? 'primary.main' : 'divider',
                    color: hasActiveFilters ? 'primary.main' : 'action.active',
                    borderRadius: 1,
                  }}
                >
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Table */}
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Box sx={{ p: 2 }}>
                <Alert severity="error">
                  Erro ao carregar reservas: {error instanceof Error ? error.message : 'Erro desconhecido'}
                </Alert>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.selected' }}>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                          SOLICITANTE
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                          SALA
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                          DATA E HORÁRIO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                          TÍTULO
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', width: 120 }}>
                          QUANT. PESSOAS
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                          STATUS
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', width: 72 }}
                          align="center"
                        >
                          AÇÕES
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                            Nenhuma reserva encontrada.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.map((booking) => {
                          const { date, time } = formatDateRange(booking.period.from, booking.period.to);
                          return (
                            <TableRow key={booking.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar sx={{ width: 36, height: 36, fontSize: '0.85rem', bgcolor: 'primary.light' }}>
                                    {booking.user.name.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                      {booking.user.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {booking.user.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>{booking.room.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Capacidade: {booking.room.capacity}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>{date}</Typography>
                                <Typography variant="caption" color="text.secondary">{time}</Typography>
                              </TableCell>

                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                  {booking.title}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: booking.numberOfPeople ? 'text.primary' : 'text.disabled' }}>
                                  <GroupIcon sx={{ fontSize: 14 }} />
                                  <Typography variant="body2">
                                    {booking.numberOfPeople ?? 'Não informado'}
                                  </Typography>
                                </Box>
                              </TableCell>

                              <TableCell>
                                <BookingStatusChip status={booking.status} />
                              </TableCell>

                              <TableCell align="center">
                                <Tooltip title="Ver detalhes">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenBooking(booking.id)}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {pagesCount > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, bookings.length === 0 ? 0 : (page - 1) * PAGE_SIZE + bookings.length)}–{Math.min(page * PAGE_SIZE, (page - 1) * PAGE_SIZE + bookings.length)} de {pagesCount * PAGE_SIZE}
                    </Typography>
                    <Pagination count={pagesCount} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" />
                  </Box>
                )}
              </>
            )}
          </>
        )}

        {/* Tab: Calendário */}
        {tab === 1 && (
          <BookingCalendar
            onViewBooking={(booking) => handleOpenBooking(booking.id)}
          />
        )}
      </Paper>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: 2, width: 300, p: 2.5, mt: 0.5 } } }}
      >
        {/* Status */}
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Status
        </Typography>
        <FormGroup sx={{ mt: 0.5, mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    size="small"
                    checked={pendingStatuses.includes(opt.value)}
                    onChange={() => toggleStatus(opt.value)}
                  />
                }
                label={<Typography variant="body2">{opt.label}</Typography>}
                sx={{ width: '50%', m: 0 }}
              />
            ))}
          </Box>
        </FormGroup>

        <Divider sx={{ mb: 2 }} />

        {/* Data */}
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Data
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, mb: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            type="date"
            label="Início"
            value={pendingDateFrom}
            onChange={(e) => setPendingDateFrom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1 }}
          />
          <Typography variant="body2" color="text.secondary">até</Typography>
          <TextField
            size="small"
            type="date"
            label="Fim"
            value={pendingDateTo}
            onChange={(e) => setPendingDateTo(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1 }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Sala */}
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Sala
        </Typography>
        <Select
          size="small"
          fullWidth
          displayEmpty
          value={pendingRoomId}
          onChange={(e) => setPendingRoomId(e.target.value)}
          sx={{ mt: 0.5, mb: 2.5 }}
        >
          <MenuItem value="">Todas as salas</MenuItem>
          {rooms.map((r) => (
            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
          ))}
        </Select>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button size="small" color="inherit" onClick={clearFilters}>
            Limpar
          </Button>
          <Button size="small" variant="contained" onClick={applyFilters}>
            Aplicar Filtros
          </Button>
        </Box>
      </Popover>

      {/* Dialogs */}
      <CreateBookingDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <BookingViewModal />
    </Box>
  );
};

export default BookingsPage;
