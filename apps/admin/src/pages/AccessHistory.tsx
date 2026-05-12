import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAccessLogsByDay } from '../hooks/useAccessLogsByDay';

function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(entryTime: string, exitTime: string | null): string {
  const exit = exitTime ? new Date(exitTime).getTime() : Date.now();
  const minutes = Math.floor((exit - new Date(entryTime).getTime()) / 60_000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return `${h}h ${m}min`;
}

const AccessHistoryPage: React.FC = () => {
  const [day, setDay] = useState(todayString);

  const { items, isLoading, isError, error } = useAccessLogsByDay(day);

  const formattedDate = new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Histórico de Acessos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consulte os registros de entrada e saída por dia.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Selecionar dia"
          type="date"
          size="small"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Erro ao carregar histórico'}
        </Alert>
      ) : (
        <>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            {items.length} registro{items.length !== 1 ? 's' : ''} em {formattedDate}
          </Typography>

          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.selected' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                      MEMBRO
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                      CARGO / INSTITUIÇÃO
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                      ENTRADA
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                      SAÍDA
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                      PERMANÊNCIA
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        Nenhum acesso registrado neste dia.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map(({ accessLog, user }) => (
                      <TableRow key={accessLog.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.light' }}>
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {user.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.jobTitle ?? '—'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.company ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatTime(accessLog.entryTime)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color={accessLog.exitTime ? 'text.primary' : 'warning.main'}>
                            {accessLog.exitTime ? formatTime(accessLog.exitTime) : 'Ativo'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDuration(accessLog.entryTime, accessLog.exitTime)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AccessHistoryPage;
