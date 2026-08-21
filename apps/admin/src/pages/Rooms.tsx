import React, { useState } from 'react';
import { Box, Typography, Button, Grid, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, FormControlLabel, Switch } from '@mui/material';
import { Add as AddIcon, Block as BlockIcon } from '@mui/icons-material';
import { RoomCard, type Room } from '../components/rooms/RoomCard';
import { EditRoomDialog } from '../components/rooms/EditRoomDialog';
import { OperatingHoursDialog } from '../components/rooms/OperatingHoursDialog';
import { GlobalRestrictionsDialog } from '../components/rooms/GlobalRestrictionsDialog';
import { useRooms } from '../hooks/useRooms';

const RoomsPage: React.FC = () => {
  const { rooms, isLoading, isError, error, refetch, findRoom, createRoom, isCreating, createError, deleteRoom } = useRooms();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOperatingHoursOpen, setIsOperatingHoursOpen] = useState(false);
  const [roomForOperatingHours, setRoomForOperatingHours] = useState<Room | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createCapacity, setCreateCapacity] = useState<number | string>('');
  const [createDescription, setCreateDescription] = useState('');
  const [createEnabled, setCreateEnabled] = useState(true);

  const [isGlobalRestrictionsOpen, setIsGlobalRestrictionsOpen] = useState(false);

  const handleEdit = (id: string) => {
    const room = findRoom(id);
    if (room) {
      setSelectedRoom(room);
      setIsEditOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setRoomToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (roomToDelete) {
      deleteRoom(roomToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setRoomToDelete(null);
        },
        onError: () => alert('Erro ao excluir sala. Verifique o console.'),
      });
    }
  };

  const handleOperatingHours = (id: string) => {
    const room = findRoom(id);
    if (room) {
      setRoomForOperatingHours(room);
      setIsOperatingHoursOpen(true);
    }
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom(
      {
        name: createName,
        capacity: Number(createCapacity),
        enabled: createEnabled,
        description: createDescription.trim() || null,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setCreateName('');
          setCreateCapacity('');
          setCreateDescription('');
          setCreateEnabled(true);
        },
      },
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header: Título e Botão */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Gerenciar Salas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie os espaços disponíveis no Locomotiva Hub.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<BlockIcon />}
            onClick={() => setIsGlobalRestrictionsOpen(true)}
          >
            Feriados
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateOpen(true)}
            sx={{ bgcolor: 'primary.main' }}
          >
            Nova Sala
          </Button>
        </Box>
      </Box>

      {/* Conteúdo: Loading, Error ou Grid de Salas */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          Erro ao carregar as salas: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {rooms.map((room: Room) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
              <RoomCard
                room={room}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onOperatingHours={handleOperatingHours}
              />
            </Grid>
          ))}

          {rooms.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                Nenhuma sala encontrada.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {/* Dialog de Criação */}
      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(5px)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
            },
          },
          paper: { sx: { borderRadius: 2 } },
        }}
      >
        <form onSubmit={handleSubmitCreate}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Nova Sala</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {createError && <Alert severity="error">{createError}</Alert>}
              <TextField
                label="Nome da Sala"
                variant="outlined"
                fullWidth
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
              />
              <TextField
                label="Capacidade"
                variant="outlined"
                type="number"
                fullWidth
                value={createCapacity}
                onChange={(e) => setCreateCapacity(e.target.value)}
                required
                slotProps={{ htmlInput: { min: 1 } }}
              />
              <TextField
                label="Descrição da Sala"
                variant="outlined"
                fullWidth
                multiline
                minRows={3}
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Ex.: Sala de treinamento, reuniões e workshop. Monitor de 75 polegadas com cabo HDMI e quadro branco."
                helperText={`Aparece no app antes da pessoa escolher a sala e nos detalhes da reserva. ${createDescription.trim().length}/500`}
                error={createDescription.trim().length > 500}
                slotProps={{ htmlInput: { maxLength: 500 } }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box>
                  <Typography variant="subtitle2">Status da Sala</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {createEnabled ? 'A sala estará visível para reservas.' : 'A sala ficará oculta e não poderá receber reservas.'}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={createEnabled}
                      onChange={(e) => setCreateEnabled(e.target.checked)}
                      color="success"
                    />
                  }
                  label={createEnabled ? 'Ativa' : 'Inativa'}
                  labelPlacement="start"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsCreateOpen(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isCreating}
              startIcon={isCreating ? <CircularProgress size={20} /> : null}
            >
              {isCreating ? 'Criando...' : 'Criar Sala'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de Edição */}
      <EditRoomDialog
        key={selectedRoom?.id}
        open={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedRoom(null); }}
        room={selectedRoom}
      />

      {/* Dialog de Restrições Globais */}
      <GlobalRestrictionsDialog
        open={isGlobalRestrictionsOpen}
        onClose={() => setIsGlobalRestrictionsOpen(false)}
      />

      {/* Dialog de Horários de Funcionamento */}
      <OperatingHoursDialog
        key={roomForOperatingHours?.id}
        open={isOperatingHoursOpen}
        onClose={() => { setIsOperatingHoursOpen(false); setRoomForOperatingHours(null); }}
        room={roomForOperatingHours}
        onSave={refetch}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setRoomToDelete(null); }}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setRoomToDelete(null); }} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomsPage;
