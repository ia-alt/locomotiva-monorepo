import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { People as PeopleIcon, EventNote as EventNoteIcon, Print as PrintIcon } from '@mui/icons-material';
import { orpc } from '../services/api';
import { StatCard } from '../components/dashboard/StatCard';
import { WeeklyFrequencyChart } from '../components/dashboard/WeeklyFrequencyChart';
import { RecentActivities } from '../components/dashboard/RecentActivities';

const AttentionTag: React.FC<{ text: string }> = ({ text }) => (
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
      {text}
    </Typography>
  </Box>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

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
            "status": ["pending" as never]
          }
      });
    },
  });

  const { data: pendingPrintRequestsData, isLoading: isPendingPrintRequestsLoading } = useQuery({
    queryKey: ['printing', 'pending-print-requests-count'],
    queryFn: async () => {
      return await orpc.printing.findPrintRequestsAdmin({
        pagination: { pageNumber: 1, pageSize: 1 },
        filter: { status: ['pending'] },
      });
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Visão Geral
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="PESSOAS NO HUB AGORA"
            value={activeLogsData?.count ?? 0}
            loading={isActiveLogsLoading}
            icon={<PeopleIcon fontSize="large" />}
            color="primary.main"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="RESERVAS PENDENTES"
            value={pendingBookingsData?.pagesCount ?? 0}
            loading={isPendingBookingsLoading}
            icon={<EventNoteIcon fontSize="large" />}
            color="warning.main"
          >
            <AttentionTag text="Requer aprovação" />
          </StatCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          {/* pageSize 1 → pagesCount é o total de pedidos pendentes */}
          <Box onClick={() => navigate('/print-requests?status=pending')} sx={{ height: '100%', cursor: 'pointer' }}>
            <StatCard
              title="PEDIDOS DE IMPRESSÃO PENDENTES"
              value={pendingPrintRequestsData?.pagesCount ?? 0}
              loading={isPendingPrintRequestsLoading}
              icon={<PrintIcon fontSize="large" />}
              color="warning.main"
            >
              <AttentionTag text="Aguardando aceite" />
            </StatCard>
          </Box>
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