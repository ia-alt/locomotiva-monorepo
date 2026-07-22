import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Print as PrintIcon } from '@mui/icons-material';

// Interface baseada no retorno do backend (Printer.JsonSchema)
export interface Printer {
  id: string;
  name: string;
  model: string;
  enabled: boolean;
  notes: string | null;
  /** Há um pedido EM PRODUÇÃO nesta impressora (vem do listPrinters). */
  inUse?: boolean;
}

interface PrinterCardProps {
  printer: Printer;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PrinterCard: React.FC<PrinterCardProps> = ({ printer, onEdit, onDelete }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Box sx={{ height: 100, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PrintIcon sx={{ fontSize: 48, color: 'grey.400' }} />
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {printer.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {printer.inUse ? (
              <Chip label="Em uso" size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 600 }} />
            ) : (
              <Chip label="Livre" size="small" variant="outlined" sx={{ color: 'text.secondary' }} />
            )}
            <Chip
              label={printer.enabled ? 'Ativa' : 'Inativa'}
              color={printer.enabled ? 'success' : 'default'}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Modelo: {printer.model || '—'}
        </Typography>

        {printer.notes && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            {printer.notes}
          </Typography>
        )}
      </CardContent>

      <Box sx={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 1 }}>
        <IconButton size="small" onClick={() => onEdit(printer.id)} color="primary" aria-label="edit">
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(printer.id)} color="error" aria-label="delete">
          <DeleteIcon />
        </IconButton>
      </Box>
    </Card>
  );
};
