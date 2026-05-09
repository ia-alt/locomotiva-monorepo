import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, CircularProgress, Alert,
  Autocomplete, MenuItem, IconButton, Typography,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import { BOOKINGS_ADMIN_QUERY_KEY } from '../../hooks/useBookingsAdmin';
import { AvailabilityTimeline } from './AvailabilityTimeline';
import type { ORPCInputs } from 'src/services/types';


interface CreateBookingDialogProps {
  open: boolean;
  onClose: () => void;
}

type UserOption = { id: string; label: string; email: string };

export const CreateBookingDialog: React.FC<CreateBookingDialogProps> = ({ open, onClose }) => {
  const queryClient = useQueryClient();

  const [userInputValue, setUserInputValue] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(0);

  const { data: usersData } = useQuery({
    queryKey: ['users', 'search', userInputValue],
    queryFn: () =>
      orpc.identy.listUsers({
        pagination: { pageNumber: 1, pageSize: 10 },
        search: userInputValue || undefined,
      }),
    enabled: userInputValue.length >= 2,
    staleTime: 15_000,
  });

  const { data: roomsData } = useQuery({
    queryKey: ['booking', 'rooms'],
    queryFn: () => orpc.booking.listRooms({}),
    staleTime: 5 * 60_000,
  });

  const userOptions: UserOption[] = (usersData?.items ?? []).map((u: { id: string; name: string; email: string }) => ({
    id: u.id,
    label: u.name,
    email: u.email,
  }));

  const rooms = (roomsData ?? []).filter((r: { enabled: boolean }) => r.enabled);
  const selectedRoomCapacity = rooms.find((r: { id: string }) => r.id === roomId)?.capacity as number | undefined;

  const mutation = useMutation({
    mutationFn: (params: ORPCInputs["booking"]["adminCreateBooking"]) => orpc.booking.adminCreateBooking(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_ADMIN_QUERY_KEY });
      handleClose();
    },
  });

  const handleClose = () => {
    setUserInputValue('');
    setSelectedUser(null);
    setRoomId('');
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setNumberOfPeople(0);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !roomId || !date || !startTime || !endTime) return;

    const from = new Date(`${date}T${startTime}:00`).toISOString();
    const to = new Date(`${date}T${endTime}:00`).toISOString();

    mutation.mutate({
      userId: selectedUser.id,
      roomId,
      title,
      period: { from, to },
      description: description.trim(),
      numberOfPeople,
    });
  };

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
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Nova Reserva</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Autocomplete
              options={userOptions}
              value={selectedUser}
              onChange={(_, value) => setSelectedUser(value)}
              inputValue={userInputValue}
              onInputChange={(_, value) => setUserInputValue(value)}
              getOptionLabel={(option) => `${option.label} (${option.email})`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              noOptionsText={userInputValue.length < 2 ? 'Digite ao menos 2 caracteres' : 'Nenhum usuário encontrado'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Usuário"
                  required
                  placeholder="Buscar por nome ou e-mail..."
                />
              )}
            />

            <TextField
              select
              label="Sala"
              fullWidth
              required
              value={roomId}
              onChange={(e) => { setRoomId(e.target.value); setNumberOfPeople(0); }}
            >
              {rooms.map((r: { id: string; name: string; capacity: number }) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name} — cap. {r.capacity}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Data"
              type="date"
              fullWidth
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <AvailabilityTimeline
              roomId={roomId}
              date={date}
              onSelectBlock={(from, to) => {
                const formatTime = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                setStartTime(formatTime(from));

                const calculatedEndTime = new Date(from);
                calculatedEndTime.setHours(calculatedEndTime.getHours() + 4);

                if (calculatedEndTime > to) {
                  setEndTime(formatTime(to));
                } else {
                  setEndTime(formatTime(calculatedEndTime));
                }
              }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Horário de início"
                type="time"
                fullWidth
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Horário de término"
                type="time"
                fullWidth
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            <TextField
              label="Título"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião de alinhamento..."
              sx={{ marginTop: 2 }}
            />

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Número de pessoas
                {selectedRoomCapacity !== undefined && (
                  <Box component="span" sx={{ ml: 1, color: 'text.disabled', fontWeight: 400 }}>
                    (máx. {selectedRoomCapacity})
                  </Box>
                )}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setNumberOfPeople((n) => Math.max(0, n - 1))}
                  disabled={numberOfPeople <= 0}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography
                  variant="body1"
                  sx={{ minWidth: 80, textAlign: 'center', fontWeight: numberOfPeople > 0 ? 600 : 400, color: numberOfPeople > 0 ? 'text.primary' : 'text.disabled' }}
                >
                  {numberOfPeople > 0 ? numberOfPeople : 'Não informado'}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setNumberOfPeople((n) => n + 1)}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
              {selectedRoomCapacity !== undefined && numberOfPeople >= selectedRoomCapacity && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                  Limite máximo da sala atingido.
                </Typography>
              )}
            </Box>

            <TextField
              label="Finalidade"
              fullWidth
              multiline
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Reunião de projeto, Workshop..."
            />


          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending || !selectedUser || !title || !roomId || !date || !startTime || !endTime || numberOfPeople <= 0}
            startIcon={mutation.isPending ? <CircularProgress size={18} /> : null}
          >
            {mutation.isPending ? 'Criando...' : 'Criar Reserva'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
