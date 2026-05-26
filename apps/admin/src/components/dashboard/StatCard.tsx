import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';

interface StatCardProps {
  title: string;
  subtitle?: string;
  value: string | number | undefined;
  icon?: React.ReactElement;
  color?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, subtitle, value, icon, color = 'primary.main', loading = false, children }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          {loading ? (
            <Skeleton variant="text" width={80} height={64} />
          ) : (
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
              {value}
            </Typography>
          )}
          {icon && (
            <Box sx={{ color: color, display: 'flex', alignItems: 'center', mt: 0.5 }}>
              {icon}
            </Box>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
};
