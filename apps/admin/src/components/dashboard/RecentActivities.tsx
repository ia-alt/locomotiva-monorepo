import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Login as CheckinIcon,
  Logout as CheckoutIcon,
  EventAvailable as BookingConfirmedIcon,
  EventBusy as BookingCancelledIcon,
  CalendarMonth as BookingRequestIcon,
  PersonAdd as UserRegisteredIcon,
  Block as BookingRejectedIcon,
} from '@mui/icons-material';
import { useRecentActivities } from '../../hooks/useRecentActivities';

type ActivityType =
  | 'checkin'
  | 'checkout'
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_rejected'
  | 'user_registered';

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  checkin: {
    icon: <CheckinIcon fontSize="small" />,
    color: '#4caf50',
    label: 'Check-in',
  },
  checkout: {
    icon: <CheckoutIcon fontSize="small" />,
    color: '#ff9800',
    label: 'Check-out',
  },
  booking_request: {
    icon: <BookingRequestIcon fontSize="small" />,
    color: '#2196f3',
    label: 'Reserva solicitada',
  },
  booking_confirmed: {
    icon: <BookingConfirmedIcon fontSize="small" />,
    color: '#009688',
    label: 'Reserva confirmada',
  },
  booking_cancelled: {
    icon: <BookingCancelledIcon fontSize="small" />,
    color: '#f44336',
    label: 'Reserva cancelada',
  },
  booking_rejected: {
    icon: <BookingRejectedIcon fontSize="small" />,
    color: '#b71c1c',
    label: 'Reserva rejeitada',
  },
  user_registered: {
    icon: <UserRegisteredIcon fontSize="small" />,
    color: '#9c27b0',
    label: 'Novo cadastro',
  },
};

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `${diffMin} min atrás`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h atrás`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d atrás`;
}

export const RecentActivities: React.FC = () => {
  const { data, isLoading, isError } = useRecentActivities();
  const activities = data?.activities ?? [];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pb: 0 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 1 }}>
          Últimas Atividades
        </Typography>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 200 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {isError && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 200 }}>
            <Typography variant="body2" color="text.secondary">
              Erro ao carregar atividades
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && activities.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 200 }}>
            <Typography variant="body2" color="text.secondary">
              Nenhuma atividade recente
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && activities.length > 0 && (
          <List disablePadding sx={{ flexGrow: 1 }}>
            {activities.map((activity, index) => {
              const config = ACTIVITY_CONFIG[activity.type as ActivityType];
              return (
                <React.Fragment key={`${activity.type}-${activity.occurredAt}-${index}`}>
                  <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: `${config.color}20`,
                          color: config.color,
                        }}
                      >
                        {config.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                          {config.label}: {activity.userName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {activity.description} · {formatRelativeTime(activity.occurredAt)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < activities.length - 1 && <Divider variant="inset" component="li" sx={{ ml: '44px' }} />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
