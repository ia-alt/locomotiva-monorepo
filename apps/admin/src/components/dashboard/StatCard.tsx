import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number | undefined;
  icon?: React.ReactElement;
  color?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'primary.main', loading = false, children }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color: color, display: 'flex', alignItems: 'center' }}>
              {icon}
            </Box>
          )}
        </Box>
        {loading ? (
           <Skeleton variant="text" width="60%" height={60} />
        ) : (
          <Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {value}
            </Typography>
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
