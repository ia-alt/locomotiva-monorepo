import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useNavigate } from 'react-router-dom';
import { useWeeklyFrequency } from '../../hooks/useWeeklyFrequency';

const DAY_LABELS_PT: Record<number, string> = {
  0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb',
};

const TODAY_COLOR = '#1565C0';
const OTHER_COLOR = '#BBDEFB';

export const WeeklyFrequencyChart: React.FC = () => {
  const { days, isLoading } = useWeeklyFrequency();
  const navigate = useNavigate();

  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  })();

  const labels = days.map((d) => DAY_LABELS_PT[new Date(d.date + 'T12:00:00').getDay()]);
  const counts = days.map((d) => d.count);
  const colors = days.map((d) => (d.date === todayStr ? TODAY_COLOR : OTHER_COLOR));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Frequência Semanal
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Número de visitantes nos últimos 7 dias
            </Typography>
          </Box>
          <Typography
            variant="body2"
            onClick={() => navigate('/frequency-report')}
            sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', mt: 0.25 }}
          >
            Ver detalhes →
          </Typography>
        </Box>

        {isLoading ? (
          <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2, mt: 1 }} />
        ) : (
          <BarChart
            xAxis={[{
              scaleType: 'band',
              data: labels,
              colorMap: { type: 'ordinal', colors },
              disableLine: true,
              disableTicks: true,
              tickLabelStyle: { fontWeight: 600 },
            }]}
            yAxis={[{
              disableLine: true,
              disableTicks: true,
              tickLabelStyle: { fontSize: 11, fill: '#9e9e9e' },
              tickNumber: 4,
            }]}
            series={[{ data: counts }]}
            height={300}
            margin={{ top: 8, right: 8, bottom: 32, left: 32 }}
            grid={{ horizontal: true }}
            slotProps={{ legend: { hidden: true } }}
            sx={{
              '& .MuiChartsGrid-line': {
                stroke: '#f0f0f0',
                strokeDasharray: '4 4',
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};
