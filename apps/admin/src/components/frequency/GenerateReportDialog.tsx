import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem,
  Typography, Box, CircularProgress, Alert,
} from '@mui/material';
import { PictureAsPdf as PdfIcon, Download as DownloadIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { orpc } from '../../services/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

function generatePDF(data: Awaited<ReturnType<typeof orpc.coworking.getYearlyReport>>) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PRIMARY = [21, 101, 192] as [number, number, number];
  const LIGHT_GRAY = [248, 248, 248] as [number, number, number];
  const W = 210;

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Frequência', 14, 17);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Locomotiva Hub  ·  Ano ${data.year}`, 14, 27);

  doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, W - 14, 32, { align: 'right' });

  // ── Resumo Anual ──────────────────────────────────────────────────────────
  let y = 48;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Anual', 14, y);
  y += 6;

  const kpis = [
    { label: 'Total de visitas', value: String(data.yearTotal) },
    { label: 'Média diária', value: `${data.yearDailyAverage} visitas/dia` },
    { label: 'Mês mais movimentado', value: data.bestMonth ? `${data.bestMonth.monthName} (${data.bestMonth.total})` : '—' },
    { label: 'Dia mais movimentado', value: data.busiestWeekday ? `${data.busiestWeekday.weekday} (média ${data.busiestWeekday.average})` : '—' },
  ];

  kpis.forEach((kpi, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = 14 + col * 93;
    const by = y + row * 20;
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(bx, by, 88, 16, 2, 2, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(kpi.label.toUpperCase(), bx + 4, by + 6);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(kpi.value, bx + 4, by + 13);
  });

  y += 46;

  // ── Distribuição por Dia da Semana ────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Distribuição por Dia da Semana', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Dia da Semana', 'Média de visitas/dia']],
    body: data.weekdayAveragesYearly.map((w) => [w.weekday, w.average]),
    headStyles: { fillColor: PRIMARY, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 60, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── Detalhamento Mensal ───────────────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Detalhamento por Mês', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Mês', 'Total', 'Média/dia', 'Dia de pico', 'Pico', 'Dia mais movimentado']],
    body: data.months.map((m) => [
      m.monthName,
      String(m.total),
      String(m.dailyAverage),
      m.peakDate ?? '—',
      String(m.peakCount),
      m.busiestWeekday ?? '—',
    ]),
    headStyles: { fillColor: PRIMARY, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Detalhamento semanal por mês ──────────────────────────────────────────
  let firstMonthSection = true;
  for (const month of data.months) {
    const weekdayRows = month.weekdayAverages.map((w) => [w.weekday, String(w.total ?? 0)]);

    if (firstMonthSection) {
      doc.addPage();
      firstMonthSection = false;
      y = 20;
    } else {
      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`${month.monthName} — ${month.total} visitas  ·  Média ${month.dailyAverage}/dia`, 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Dia da Semana', 'Total de visitas']],
      body: weekdayRows,
      headStyles: { fillColor: [66, 165, 245] as [number, number, number], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 60, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
      tableWidth: 120,
    });
  }

  // ── Footer em todas as páginas ────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.text(`Locomotiva Hub  ·  Relatório de Frequência ${data.year}`, 14, 290);
    doc.text(`${p} / ${totalPages}`, W - 14, 290, { align: 'right' });
  }

  doc.save(`relatorio-frequencia-${data.year}.pdf`);
}

export const GenerateReportDialog: React.FC<Props> = ({ open, onClose }) => {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orpc.coworking.getYearlyReport({ year });
      generatePDF(data);
      onClose();
    } catch {
      setError('Erro ao buscar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PdfIcon color="primary" />
        Gerar Relatório Anual
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Selecione o ano para gerar um PDF completo com o retrospecto de frequência, detalhamento mensal e distribuição por dia da semana.
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Ano</InputLabel>
          <Select
            value={year}
            label="Ano"
            onChange={(e) => setYear(Number(e.target.value))}
            disabled={loading}
          >
            {YEAR_OPTIONS.map((y) => (
              <MenuItem key={y} value={y}>
                {y} {y === CURRENT_YEAR ? '(atual)' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Buscando dados e gerando PDF...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Gerando...' : 'Gerar PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
