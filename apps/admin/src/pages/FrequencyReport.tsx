import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  Skeleton, Chip, Divider, Button,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, TrendingUp, TrendingDown, TrendingFlat, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { useNavigate } from 'react-router-dom';
import { useAccessStats } from '../hooks/useAccessStats';
import { GenerateReportDialog } from '../components/frequency/GenerateReportDialog';

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function monthNamePt(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

const TODAY_COLOR = '#1565C0';
const OTHER_COLOR = '#BBDEFB';

interface KpiCardProps {
  label: string;
  value: number | string | null | undefined;
  loading: boolean;
  chip?: React.ReactNode;
  subtitle?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, loading, chip, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={80} height={52} />
      ) : (
        <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.1, mt: 0.5 }}>
          {value ?? '—'}
        </Typography>
      )}
      {subtitle && !loading && (
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      )}
      {chip && !loading && <Box sx={{ mt: 0.75 }}>{chip}</Box>}
    </CardContent>
  </Card>
);

const FrequencyReport: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useAccessStats();
  const [reportOpen, setReportOpen] = useState(false);

  const todayStr = toLocalDateStr(new Date());

  // ── Current week bar chart ──────────────────────────────────────────────
  const DAY_PT: Record<number, string> = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb' };
  const weekLabels = (data?.currentWeek ?? []).map((d) => DAY_PT[new Date(d.date + 'T12:00:00').getDay()]);
  const weekCounts = (data?.currentWeek ?? []).map((d) => d.count);
  const weekColors = (data?.currentWeek ?? []).map((d) => (d.date === todayStr ? TODAY_COLOR : OTHER_COLOR));

  // ── Monthly line charts ─────────────────────────────────────────────────
  const curMonthLabels = (data?.currentMonth ?? []).map((d) => String(new Date(d.date + 'T12:00:00').getDate()));
  const curMonthCounts = (data?.currentMonth ?? []).map((d) => d.count) as (number | null)[];

  const prevMonthLabels = (data?.previousMonth ?? []).map((d) => String(new Date(d.date + 'T12:00:00').getDate()));
  const prevMonthCounts = (data?.previousMonth ?? []).map((d) => d.count);

  // ── Weekday averages bar chart ──────────────────────────────────────────
  const wdLabels = (data?.weekdayAverages ?? []).map((w) => w.weekday);
  const wdValues = (data?.weekdayAverages ?? []).map((w) => w.average);
  const maxWd = Math.max(...wdValues, 0);
  const wdColors = wdValues.map((v) => (v === maxWd && maxWd > 0 ? '#1565C0' : '#90CAF9'));

  // ── Change chip ─────────────────────────────────────────────────────────
  const change = data?.totals.changePercentVsDailyAvg;
  const ChangeChip = change != null ? (
    <Chip
      size="small"
      icon={change > 2 ? <TrendingUp fontSize="small" /> : change < -2 ? <TrendingDown fontSize="small" /> : <TrendingFlat fontSize="small" />}
      label={`${change > 0 ? '+' : ''}${change}% vs média ant.`}
      color={change > 0 ? 'success' : change < 0 ? 'error' : 'default'}
      sx={{ fontSize: '0.68rem' }}
    />
  ) : null;

  const curMonthName = data?.currentMonth[0] ? monthNamePt(data.currentMonth[0].date) : '';
  const prevMonthName = data?.previousMonth[0] ? monthNamePt(data.previousMonth[0].date) : '';

  const chartAxisStyle = {
    xAxis: [{ disableLine: true as const, disableTicks: true as const, tickLabelStyle: { fontWeight: 600 as const, fontSize: 12 } }],
    yAxis: [{ disableLine: true as const, disableTicks: true as const, tickLabelStyle: { fontSize: 11, fill: '#9e9e9e' } as const, tickNumber: 4 }],
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArrowBackIcon
            onClick={() => navigate('/dashboard')}
            sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
          />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Relatório de Frequência
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={() => setReportOpen(true)}
        >
          Gerar Relatório
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Análise detalhada de visitas ao coworking — por semana, mês e dia da semana.
      </Typography>

      <GenerateReportDialog open={reportOpen} onClose={() => setReportOpen(false)} />

      {/* KPI row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard label="Esta semana" value={data?.totals.thisWeek} loading={isLoading} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            label="Este mês"
            value={data?.totals.thisMonth}
            loading={isLoading}
            chip={ChangeChip}
            subtitle={curMonthName}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            label="Mês anterior"
            value={data?.totals.previousMonthTotal}
            loading={isLoading}
            subtitle={prevMonthName}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard
            label="Média diária"
            value={data?.totals.dailyAverageThisMonth}
            loading={isLoading}
            subtitle="Mês atual (dias passados)"
          />
        </Grid>
      </Grid>

      {/* Gráfico anual */}
      {(() => {
        const yearMonthly: { month: number; label: string; total: number; isFuture: boolean }[] = data?.currentYearMonthly ?? [];
        const curMonth = new Date().getMonth() + 1;
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Visão Anual — {new Date().getFullYear()}</Typography>
              <Typography variant="caption" color="text.secondary">Total de visitas por mês</Typography>
              {isLoading ? <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 1 }} /> : (
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    data: yearMonthly.map((m) => m.label),
                    colorMap: {
                      type: 'ordinal',
                      colors: yearMonthly.map((m) =>
                        m.isFuture ? '#E3F2FD' : m.month === curMonth ? '#1565C0' : '#64B5F6'
                      ),
                    },
                    disableLine: true,
                    disableTicks: true,
                    tickLabelStyle: { fontWeight: 600, fontSize: 11 },
                  }]}
                  yAxis={[{ disableLine: true, disableTicks: true, tickLabelStyle: { fontSize: 11, fill: '#9e9e9e' }, tickNumber: 4 }]}
                  series={[{ data: yearMonthly.map((m) => m.total) }]}
                  height={220}
                  margin={{ top: 8, right: 8, bottom: 32, left: 40 }}
                  grid={{ horizontal: true }}
                  sx={{
                    '& .MuiChartsGrid-line': { stroke: '#f5f5f5', strokeDasharray: '4 4' },
                    '& .MuiChartsLegend-root': { display: 'none' },
                  }}
                />
              )}
            </CardContent>
          </Card>
        );
      })()}

      <Grid container spacing={3}>
        {/* Semana atual */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Semana Atual</Typography>
              <Typography variant="caption" color="text.secondary">Segunda a domingo — hoje em destaque</Typography>
              {isLoading ? <Skeleton variant="rectangular" height={230} sx={{ mt: 2, borderRadius: 1 }} /> : (
                <BarChart
                  xAxis={[{ scaleType: 'band', data: weekLabels, colorMap: { type: 'ordinal', colors: weekColors }, ...chartAxisStyle.xAxis[0] }]}
                  yAxis={chartAxisStyle.yAxis}
                  series={[{ data: weekCounts }]}
                  height={250}
                  margin={{ top: 8, right: 8, bottom: 32, left: 32 }}
                  grid={{ horizontal: true }}
                  slotProps={{ legend: { hidden: true } }}
                  sx={{ '& .MuiChartsGrid-line': { stroke: '#f5f5f5', strokeDasharray: '4 4' } }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Média por dia da semana */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Dias Mais Movimentados</Typography>
              <Typography variant="caption" color="text.secondary">Média de visitas por dia da semana — mês atual</Typography>
              {isLoading ? <Skeleton variant="rectangular" height={230} sx={{ mt: 2, borderRadius: 1 }} /> : (
                <BarChart
                  xAxis={[{ scaleType: 'band', data: wdLabels, colorMap: { type: 'ordinal', colors: wdColors }, ...chartAxisStyle.xAxis[0] }]}
                  yAxis={chartAxisStyle.yAxis}
                  series={[{ data: wdValues }]}
                  height={250}
                  margin={{ top: 8, right: 8, bottom: 32, left: 32 }}
                  grid={{ horizontal: true }}
                  slotProps={{ legend: { hidden: true } }}
                  sx={{ '& .MuiChartsGrid-line': { stroke: '#f5f5f5', strokeDasharray: '4 4' } }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Linha: mês atual */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Evolução — Mês Atual</Typography>
              <Typography variant="caption" color="text.secondary">{curMonthName}</Typography>
              {isLoading ? <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 1 }} /> : (
                <LineChart
                  xAxis={[{ scaleType: 'band', data: curMonthLabels, ...chartAxisStyle.xAxis[0] }]}
                  yAxis={chartAxisStyle.yAxis}
                  series={[{ data: curMonthCounts, color: '#1565C0', showMark: false, connectNulls: false }]}
                  height={220}
                  margin={{ top: 8, right: 8, bottom: 32, left: 32 }}
                  grid={{ horizontal: true }}
                  slotProps={{ legend: { hidden: true } }}
                  sx={{ '& .MuiChartsGrid-line': { stroke: '#f5f5f5', strokeDasharray: '4 4' } }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Linha: mês anterior */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Evolução — Mês Anterior</Typography>
              <Typography variant="caption" color="text.secondary">{prevMonthName}</Typography>
              {isLoading ? <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 1 }} /> : (
                <LineChart
                  xAxis={[{ scaleType: 'band', data: prevMonthLabels, ...chartAxisStyle.xAxis[0] }]}
                  yAxis={chartAxisStyle.yAxis}
                  series={[{ data: prevMonthCounts, color: '#78909C', showMark: false }]}
                  height={220}
                  margin={{ top: 8, right: 8, bottom: 32, left: 32 }}
                  grid={{ horizontal: true }}
                  slotProps={{ legend: { hidden: true } }}
                  sx={{ '& .MuiChartsGrid-line': { stroke: '#f5f5f5', strokeDasharray: '4 4' } }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Ranking dias da semana */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Ranking de Dias — Mês Atual</Typography>
              <Grid container spacing={1}>
                {[...( data?.weekdayAverages ?? [])].sort((a, b) => b.average - a.average).map((w, i) => (
                  <Grid key={w.weekday} size={{ xs: 6, sm: 3, md: 12 / 7 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: i === 0 ? 'primary.main' : i === 1 ? 'primary.light' : '#f5f5f5',
                        color: i <= 1 ? 'white' : 'text.primary',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.85 }}>
                        #{i + 1} {w.weekday}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {w.average}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.75 }}>
                        média/dia
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">
        Dados atualizados a cada 5 minutos. Considera todos os check-ins registrados no sistema.
      </Typography>
    </Box>
  );
};

export default FrequencyReport;
