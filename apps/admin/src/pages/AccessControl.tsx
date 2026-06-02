import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Logout as CheckoutIcon, History as HistoryIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { orpc } from '../services/api';
import { toTimeStringInTZ } from '../utils/timezone';
import { useActiveAccessLogs, ACTIVE_ACCESS_LOGS_QUERY_KEY } from '../hooks/useActiveAccessLogs';
import { QuickCheckinPanel } from '../components/access-control/QuickCheckinPanel';

function formatElapsedTime(entryTime: string): string {
  const diffMs = Date.now() - new Date(entryTime).getTime();
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
}


const ForceCheckoutButton: React.FC<{ userId: string; userName: string }> = ({ userId, userName }) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const checkoutMutation = useMutation({
    mutationFn: () => orpc.coworking.adminCheckout({ userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ACTIVE_ACCESS_LOGS_QUERY_KEY] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Erro ao realizar checkout');
    },
  });

  return (
    <Box>
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
      <Button
        size="small"
        variant="outlined"
        color="error"
        startIcon={checkoutMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <CheckoutIcon fontSize="small" />}
        disabled={checkoutMutation.isPending}
        onClick={() => checkoutMutation.mutate()}
        title={`Forçar checkout de ${userName}`}
        sx={{ whiteSpace: 'nowrap' }}
      >
        {checkoutMutation.isPending ? 'Saindo...' : 'Forçar Checkout'}
      </Button>
    </Box>
  );
};

const AccessControlPage: React.FC = () => {
  const { sessions, isLoading, isError, error } = useActiveAccessLogs();
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  // Re-render every minute to update elapsed time display
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Controle de Acesso
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie as entradas e saídas dos membros do coworking em tempo real.
        </Typography>
      </Box>

      {/* Quick Check-in Panel */}
      <QuickCheckinPanel />

      {/* Active Users Table */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Usuários Ativos
          </Typography>
          {!isLoading && (
            <Box
              sx={{
                bgcolor: sessions.length > 0 ? 'success.main' : 'grey.400',
                color: 'white',
                borderRadius: 10,
                px: 1.2,
                py: 0.2,
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              {sessions.length}
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/access-history')}
          >
            Histórico
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">
            Erro ao carregar sessões: {error instanceof Error ? error.message : 'Erro desconhecido'}
          </Alert>
        ) : (
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.selected' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                      MEMBRO
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                      HORA DE ENTRADA
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                      TEMPO DECORRIDO
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', width: 160 }} align="right">
                      AÇÕES
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        Nenhum usuário ativo no momento.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((session) => (
                      <TableRow key={session.logId} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 38, height: 38, fontSize: '0.9rem', bgcolor: 'success.light' }}>
                              {session.userName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {session.userName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {session.userEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {toTimeStringInTZ(session.entryTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500} color="success.dark">
                            {formatElapsedTime(session.entryTime)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <ForceCheckoutButton userId={session.userId} userName={session.userName} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default AccessControlPage;
