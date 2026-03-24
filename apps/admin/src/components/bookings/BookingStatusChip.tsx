import React from 'react';
import { Chip } from '@mui/material';

type StatusConfig = {
  label: string;
  bgcolor: string;
  color: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending:   { label: 'Aguardando',      bgcolor: '#fef9c3', color: '#854d0e' },
  confirmed: { label: 'Confirmado',      bgcolor: '#dcfce7', color: '#166534' },
  rejected:  { label: 'Rejeitado',       bgcolor: '#fee2e2', color: '#991b1b' },
  cancelled: { label: 'Cancelado',       bgcolor: '#ede9fe', color: '#5b21b6' },
  no_show:   { label: 'Não compareceu',  bgcolor: '#f3f4f6', color: '#4b5563' },
};

interface BookingStatusChipProps {
  status: string;
}

export const BookingStatusChip: React.FC<BookingStatusChipProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? { label: status, bgcolor: '#f3f4f6', color: '#4b5563' };
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{ bgcolor: config.bgcolor, color: config.color, fontWeight: 500, border: 'none' }}
    />
  );
};
