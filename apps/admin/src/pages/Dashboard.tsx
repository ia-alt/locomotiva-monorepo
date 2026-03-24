import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { People as PeopleIcon, EventNote as EventNoteIcon } from '@mui/icons-material';
import { orpc } from '../services/api';
import { StatCard } from '../components/dashboard/StatCard';
import { WeeklyFrequencyChart } from '../components/dashboard/WeeklyFrequencyChart';
import { RecentActivities } from '../components/dashboard/RecentActivities';

const Dashboard: React.FC = () => {
  const { data: activeLogsData, isLoading: isActiveLogsLoading } = useQuery({
    queryKey: ['coworking', 'active-access-logs-count'],
    queryFn: async () => {
      return await orpc.coworking.countActiveAccessLogs({});
    },
  });

  const { data: pendingBookingsData, isLoading: isPendingBookingsLoading } = useQuery({
    queryKey: ['booking', 'pending-bookings-count'],
    queryFn: async () => {
      return await orpc.booking.findBookings({
        "pagination": {
          "pageNumber": 1,
          "pageSize": 1
        },
          "filter": {
            "status": ["pending"]
          }
      });
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Visão Geral
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            title="PESSOAS NO HUB AGORA"
            value={activeLogsData?.count ?? 0}
            loading={isActiveLogsLoading}
            icon={<PeopleIcon fontSize="large" />}
            color="primary.main"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            title="RESERVAS PENDENTES"
            value={pendingBookingsData?.pagesCount ?? 0}
            loading={isPendingBookingsLoading}
            icon={<EventNoteIcon fontSize="large" />}
            color="warning.main"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Box
                sx={{
                  bgcolor: 'warning.main',
                  color: 'white',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  mr: 1,
                  textTransform: 'uppercase',
                }}
              >
                Atenção
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', opacity: 0.8 }}>
                Requer aprovação
              </Typography>
            </Box>
          </StatCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <WeeklyFrequencyChart />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <RecentActivities />
        </Grid>
        
      </Grid>
    </Box>
  );
};

export default Dashboard;