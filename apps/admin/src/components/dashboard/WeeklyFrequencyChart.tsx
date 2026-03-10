import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export const WeeklyFrequencyChart: React.FC = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 2 }}>
          Frequência Semanal
        </Typography>
        <Box sx={{ flexGrow: 1, minHeight: 300, bgcolor: '#f5f5f5', borderRadius: 2 }}>
             {/* o grafico vem aqui*/}
        </Box>
      </CardContent>
    </Card>
  );
};
