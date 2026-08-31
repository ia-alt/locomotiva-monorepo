import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Typography
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import type { Room } from './RoomCard';

interface EditRoomDialogProps {
  open: boolean;
  onClose: () => void;
  room: Room | null;
}

export const EditRoomDialog: React.FC<EditRoomDialogProps> = ({ open, onClose, room }) => {
  const queryClient = useQueryClient();
  // Initialize state from props, but allow internal updates
  const [name, setName] = useState(room?.name || '');
  const [capacity, setCapacity] = useState<number | string>(room?.capacity || '');
  const [enabled, setEnabled] = useState<boolean>(room?.enabled ?? true);
  const [photoUrl, setPhotoUrl] = useState<string>(room?.photoUrl || '');
  const [description, setDescription] = useState<string>(room?.description || '');
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: async (input: { roomId: string; name: string; capacity: number; enabled: boolean; photoUrl: string; description: string }) => {
      await orpc.booking.updateRoom({
        roomId: input.roomId,
        data: {
          name: input.name,
          capacity: input.capacity,
          photoUrl: input.photoUrl || null,
          description: input.description.trim() || null,
        },
      });

      if (room?.enabled !== input.enabled) {
         await orpc.booking.setRoomEnabled({
          roomId: input.roomId,
          enabled: input.enabled,
        });
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      onClose();
      setError(null);
    },
    onError: (err) => {
      console.error('Failed to update room:', err);
      setError(err instanceof Error ? err.message : 'Falha ao atualizar sala');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    
    updateMutation.mutate({
      roomId: room.id,
      name,
      capacity: Number(capacity),
      enabled,
      photoUrl,
      description,
    });
  };

  return (
    <Dialog 
        open={open} 
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        slotProps={{
            backdrop: {
                sx: {
                    backdropFilter: 'blur(5px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                },
            },
            paper: {
                sx: {
                    borderRadius: 2,
                },
            },
        }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Editar Sala</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              label="Nome da Sala"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <TextField
              label="Capacidade"
              variant="outlined"
              type="number"
              fullWidth
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              slotProps={{
                htmlInput: { min: 1 }
              }}
            />

            <TextField
              label="Descrição da Sala"
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Sala de treinamento, reuniões e workshop. Monitor de 75 polegadas com cabo HDMI e quadro branco."
              helperText={`Aparece no app antes da pessoa escolher a sala e nos detalhes da reserva. ${description.trim().length}/500`}
              error={description.trim().length > 500}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />

            <TextField
              label="URL da Foto da Sala"
              variant="outlined"
              fullWidth
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://exemplo.com/foto-da-sala.jpg"
              helperText="Cole a URL de uma imagem para exibir na seleção de salas"
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box>
                    <Typography variant="subtitle2">Status da Sala</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {enabled ? 'A sala está visível para reservas.' : 'A sala está oculta e não pode receber reservas.'}
                    </Typography>
                </Box>
                <FormControlLabel
                    control={
                        <Switch
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            color="success"
                        />
                    }
                    label={enabled ? "Ativa" : "Inativa"}
                    labelPlacement="start"
                />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={updateMutation.isPending}
            startIcon={updateMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
