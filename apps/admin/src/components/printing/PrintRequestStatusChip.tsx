import React from 'react';
import { Chip } from '@mui/material';
import { PRINT_REQUEST_STATUS_CONFIG } from './printRequestStatus';

interface PrintRequestStatusChipProps {
  status: string;
}

export const PrintRequestStatusChip: React.FC<PrintRequestStatusChipProps> = ({ status }) => {
  const config = PRINT_REQUEST_STATUS_CONFIG[status] ?? { label: status, bgcolor: '#f3f4f6', color: '#4b5563' };
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{ bgcolor: config.bgcolor, color: config.color, fontWeight: 500, border: 'none' }}
    />
  );
};
