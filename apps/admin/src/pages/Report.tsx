import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, CircularProgress, Alert, IconButton, Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Group as GroupIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { addMonths, subMonths } from 'date-fns';
import { useMonthReport } from '../hooks/useMonthReport';
import { useGenerateMonthReportPdf } from '../hooks/useGenerateMonthReportPdf';
import { StatCard } from '../components/dashboard/StatCard';

const DAY_PT: Record<number, string> = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb' };

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
}

const chartAxisStyle = {
  xAxis: [{ disableLine: true as const, disableTicks: true as const, tickLabelStyle: { fontWeight: 600 as const, fontSize: 12 } }],
  yAxis: [{ disableLine: true as const, disableTicks: true as const, tickLabelStyle: { fontSize: 11, fill: '#9e9e9e' } as const, tickNumber: 4 }],
};

const ReportPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateStr = toDateStr(selectedDate);
  const { data, isLoading, isError, error } = useMonthReport(dateStr);
  const { generate: generatePdf, isLoading: pdfLoading } = useGenerateMonthReportPdf();

  const handleGerarPdf = () => generatePdf(dateStr);

  const perDayLabels = (data?.totalPeoplePerDay ?? []).map((d) => String(d.day));
  const perDayTotal = (data?.totalPeoplePerDay ?? []).map((d) => d.coworking + d.booking);

  const wdLabels = (data?.totalPeopleByWeekDay ?? []).map((w) => DAY_PT[w.weekday] ?? String(w.weekday));
  const wdValues = (data?.totalPeopleByWeekDay ?? []).map((w) => w.total);
  const maxWd = Math.max(...wdValues, 0);
  const wdColors = wdValues.map((v) => (v === maxWd && maxWd > 0 ? '#1565C0' : '#90CAF9'));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Relatório
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Mês {monthLabel(selectedDate)}
            </Typography>
          </Box>

          {/* Month picker + nav buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setSelectedDate(d => subMonths(d, 1))}>
              <ChevronLeftIcon />
            </IconButton>
            <DatePicker
              views={['month', 'year']}
              value={selectedDate}
              onChange={(newValue) => { if (newValue) setSelectedDate(newValue); }}
              minDate={new Date(2026, 0, 1)}
              maxDate={new Date(2050, 11, 31)}
              slotProps={{ textField: { size: 'small', sx: { width: 'auto', minWidth: 130 } } }}
            />
            <IconButton onClick={() => setSelectedDate(d => addMonths(d, 1))}>
              <ChevronRightIcon />
            </IconButton>
            <Button variant="outlined" size="small" onClick={handleGerarPdf} disabled={pdfLoading}>
              {pdfLoading ? 'Gerando...' : 'Gerar PDF'}
            </Button>
          </Box>
        </Box>

        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error instanceof Error ? error.message : 'Erro ao carregar relatório'}
          </Alert>
        )}

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="atendimentos no"
              subtitle="Coworking"
              value={isLoading ? undefined : data?.totalPeopleCoworking ?? 0}
              loading={isLoading}
              icon={<PeopleIcon />}
              color="primary.main"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="atendimentos em"
              subtitle={isLoading ? undefined : `${data?.totalBookings ?? 0} Reservas de Salas`}
              value={isLoading ? undefined : data?.totalPeopleBooking ?? 0}
              loading={isLoading}
              icon={<EventNoteIcon />}
              color="success.main"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="atendimentos no"
              subtitle="Total"
              value={isLoading ? undefined : data?.totalPeople ?? 0}
              loading={isLoading}
              icon={<GroupIcon />}
              color="secondary.main"
            />
          </Grid>
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Evolução — Mês Atual</Typography>
                <Typography variant="caption" color="text.secondary">
                  Total de pessoas por dia (coworking + agendamentos)
                </Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <LineChart
                    xAxis={[{ scaleType: 'band', data: perDayLabels, ...chartAxisStyle.xAxis[0] }]}
                    yAxis={chartAxisStyle.yAxis}
                    series={[{ data: perDayTotal, color: '#1565C0', showMark: false, connectNulls: false }]}
                    height={220}
                    margin={{ top: 8, right: 8, bottom: 32, left: 32 }}
                    grid={{ horizontal: true }}
                    slots={{ legend: () => null }}
                    sx={{ '& .MuiChartsGrid-line': { stroke: '#f5f5f5', strokeDasharray: '4 4' } }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Dias Mais Movimentados</Typography>
                <Typography variant="caption" color="text.secondary">
                  Total de pessoas por dia da semana no mês
                </Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <BarChart
                    xAxis={[{ scaleType: 'band', data: wdLabels, colorMap: { type: 'ordinal', colors: wdColors }, ...chartAxisStyle.xAxis[0] }]}
                    yAxis={chartAxisStyle.yAxis}
                    series={[{ data: wdValues }]}
                    height={220}
                    margin={{ top: 8, right: 8, bottom: 32, left: 32 }}
                    grid={{ horizontal: true }}
                    slots={{ legend: () => null }}
                    sx={{ '& .MuiChartsGrid-line': { stroke: '#f5f5f5', strokeDasharray: '4 4' } }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabela de Agendamentos */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Agendamentos</Typography>
          </Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.selected' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>DATA</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>NOME DO EVENTO</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>RESPONSÁVEL</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>EMPRESA / INSTITUIÇÃO</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>SALA</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }} align="right">PESSOAS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.bookings ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        Nenhum agendamento neste mês.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (data?.bookings ?? []).map((item, i) => (
                      <TableRow key={i} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {new Date(item.booking.period.from).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.booking.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.light' }}>
                              {item.user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>{item.user.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.user.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.user.company ?? '—'}</Typography>
                          {item.user.jobTitle && (
                            <Typography variant="caption" color="text.secondary">{item.user.jobTitle}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{(item as any).room?.name ?? '—'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{item.booking.numberOfPeople ?? '—'}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Tabela de Coworking */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Coworking</Typography>
          </Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.selected' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>DATA</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>MEMBRO</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>EMPRESA / INSTITUIÇÃO</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>ENTRADA</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>SAÍDA</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }} align="right">DURAÇÃO</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.coworkingLogs ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        Nenhum acesso ao coworking neste mês.
                      </TableCell>
                    </TableRow>
                  ) : (() => {
                    const logs = data?.coworkingLogs ?? [];
                    const groups = logs.reduce<Record<string, typeof logs>>((acc, item) => {
                      const dateKey = new Date(item.accessLog.entryTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                      if (!acc[dateKey]) acc[dateKey] = [];
                      acc[dateKey].push(item);
                      return acc;
                    }, {});

                    return Object.entries(groups).map(([dateLabel, items]) => (
                      <React.Fragment key={dateLabel}>
                        <TableRow>
                          <TableCell colSpan={6} sx={{ bgcolor: 'action.selected', py: 1, px: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                              {dateLabel}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {items.map((item, i) => (
                          <TableRow key={i} hover>
                            <TableCell />
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.light' }}>
                                  {item.user.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>{item.user.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{item.user.email}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{item.user.company ?? '—'}</Typography>
                              {item.user.jobTitle && (
                                <Typography variant="caption" color="text.secondary">{item.user.jobTitle}</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{new Date(item.accessLog.entryTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{item.accessLog.exitTime ? new Date(item.accessLog.exitTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{item.durationMinutes != null ? `${item.durationMinutes} min` : '—'}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ));
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ReportPage;
