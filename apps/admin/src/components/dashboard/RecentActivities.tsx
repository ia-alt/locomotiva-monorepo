import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export const RecentActivities: React.FC = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 2 }}>
          Últimas Atividades
        </Typography>
        <Box sx={{ flexGrow: 1, minHeight: 300, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            {/* Espaço reservado para a lista de atividades */}
        </Box>
      </CardContent>
    </Card>
  );
};
