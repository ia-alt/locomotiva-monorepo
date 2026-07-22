import React from 'react';
import { Chip } from '@mui/material';

type StatusConfig = {
  label: string;
  bgcolor: string;
  color: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending:       { label: 'Em análise',           bgcolor: '#fef9c3', color: '#854d0e' },
  approved:      { label: 'Aprovado',             bgcolor: '#dcfce7', color: '#166534' },
  in_production: { label: 'Em produção',          bgcolor: '#dbeafe', color: '#1e40af' },
  completed:     { label: 'Pronto p/ retirada',   bgcolor: '#ccfbf1', color: '#115e59' },
  delivered:     { label: 'Entregue',             bgcolor: '#dcfce7', color: '#14532d' },
  discarded:     { label: 'Descartado',           bgcolor: '#f3f4f6', color: '#374151' },
  rejected:      { label: 'Recusado',             bgcolor: '#fee2e2', color: '#991b1b' },
  cancelled:     { label: 'Cancelado',            bgcolor: '#ede9fe', color: '#5b21b6' },
};

interface PrintRequestStatusChipProps {
  status: string;
}

export const PrintRequestStatusChip: React.FC<PrintRequestStatusChipProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? { label: status, bgcolor: '#f3f4f6', color: '#4b5563' };
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{ bgcolor: config.bgcolor, color: config.color, fontWeight: 500, border: 'none' }}
    />
  );
};
