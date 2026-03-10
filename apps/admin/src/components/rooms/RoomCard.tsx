import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Chip } from '@mui/material';
import { People as PeopleIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Definindo a interface baseada no retorno do backend (Room.JsonSchema)
export interface Room {
  id: string;
  name: string;
  capacity: number;
  enabled: boolean;
}

interface RoomCardProps {
  room: Room;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onEdit, onDelete }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Placeholder Image - Box cinza claro */}
      <Box 
        sx={{ 
          height: 140, 
          bgcolor: 'grey.300', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        {/* imagem aqui */}
      </Box>

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

        {/* Descrição curta placeholder (não vem do backend ainda) */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Sem descrição disponível.
        </Typography>
      </CardContent>

      {/* Ações: Editar e Excluir */}
      <Box sx={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 1 }}>
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
