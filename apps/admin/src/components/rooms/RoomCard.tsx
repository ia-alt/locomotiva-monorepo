import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, IconButton, Chip } from '@mui/material';
import { People as PeopleIcon, Edit as EditIcon, Delete as DeleteIcon, AccessTime as AccessTimeIcon, WarningAmber as WarningAmberIcon, MeetingRoom as MeetingRoomIcon } from '@mui/icons-material';

// Definindo a interface baseada no retorno do backend (Room.JsonSchema)
export interface Room {
  id: string;
  name: string;
  capacity: number;
  enabled: boolean;
  photoUrl: string | null;
  description: string | null;
  hasOperatingSchedule: boolean;
}

interface RoomCardProps {
  room: Room;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onOperatingHours: (id: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onEdit, onDelete, onOperatingHours }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {room.photoUrl ? (
        <CardMedia
          component="img"
          height={140}
          image={room.photoUrl}
          alt={room.name}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box sx={{ height: 140, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MeetingRoomIcon sx={{ fontSize: 48, color: 'grey.400' }} />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, pb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {room.name}
            </Typography>
            {/* Status Chip */}
            <Chip 
                label={room.enabled ? "Ativa" : "Inativa"} 
                color={room.enabled ? "success" : "default"} 
                size="small" 
                variant="outlined"
            />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
          <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">
            Capacidade: {room.capacity} Pessoas
          </Typography>
        </Box>

        {room.description ? (
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {room.description}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
            Sem descrição cadastrada
          </Typography>
        )}

        {!room.hasOperatingSchedule && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5, p: 1, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200', borderRadius: 1 }}>
            <WarningAmberIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 500 }}>
              Horário de funcionamento não estabelecido
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Ações: Horários, Editar e Excluir */}
      <Box sx={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 1 }}>
        <IconButton
          size="small"
          onClick={() => onOperatingHours(room.id)}
          color="default"
          aria-label="operating-hours"
        >
          <AccessTimeIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onEdit(room.id)}
          color="primary"
          aria-label="edit"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(room.id)}
          color="error"
          aria-label="delete"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Card>
  );
};
