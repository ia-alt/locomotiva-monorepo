import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, TextField, InputAdornment,
  CircularProgress, Alert, Pagination, IconButton, Tooltip, Chip,
  Popover, FormGroup, FormControlLabel, Checkbox, Select, MenuItem, Divider, Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Description as FileIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { usePrintRequestsAdmin, type PrintRequestAdminItem } from '../hooks/usePrintRequestsAdmin';
import { PrintRequestStatusChip } from '../components/printing/PrintRequestStatusChip';
import { PrintRequestDetailDialog } from '../components/printing/PrintRequestDetailDialog';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../services/api';

const PAGE_SIZE = 8;

const STATUS_FILTER_OPTIONS = [
  { value: 'pending', label: 'Em análise' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'in_production', label: 'Em produção' },
  { value: 'completed', label: 'Pronto p/ retirada' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'discarded', label: 'Descartado' },
  { value: 'rejected', label: 'Recusado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const PrintRequestsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<string[]>([]);
  const [pendingPrinterId, setPendingPrinterId] = useState('');
  const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);
  const [appliedPrinterId, setAppliedPrinterId] = useState('');

  const [selected, setSelected] = useState<PrintRequestAdminItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: printersData } = useQuery({
    queryKey: ['printers'],
    queryFn: () => orpc.printing.listPrinters({}),
    staleTime: 5 * 60_000,
  });
  const printers = (printersData ?? []) as { id: string; name: string }[];

  const { printRequests, pagesCount, isLoading, isError, error } = usePrintRequestsAdmin({
    page,
    pageSize: PAGE_SIZE,
    statusFilter: appliedStatuses.length ? appliedStatuses : undefined,
    printerIdFilter: appliedPrinterId || undefined,
    search: search || undefined,
  });

  const handleOpen = (item: PrintRequestAdminItem) => {
    setSelected(item);
    setIsDetailOpen(true);
  };

  // mantém o dialog com dados frescos após mutations (ex.: vincular impressora sem fechar)
  const freshSelected = selected ? (printRequests.find((r) => r.id === selected.id) ?? selected) : null;

  const openFilter = (e: React.MouseEvent<HTMLElement>) => {
    setPendingStatuses(appliedStatuses);
    setPendingPrinterId(appliedPrinterId);
    setFilterAnchor(e.currentTarget);
  };

  const applyFilters = () => {
    setAppliedStatuses(pendingStatuses);
    setAppliedPrinterId(pendingPrinterId);
    setPage(1);
    setFilterAnchor(null);
  };

  const clearFilters = () => { setPendingStatuses([]); setPendingPrinterId(''); };
  const toggleStatus = (value: string) => setPendingStatuses((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]));
  const hasActiveFilters = appliedStatuses.length > 0 || !!appliedPrinterId;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Pedidos de Impressão 3D
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analise os pedidos e acompanhe a produção — do aceite à entrega.
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', gap: 1.5, p: 2, alignItems: 'center' }}>
          <TextField
            sx={{ flexGrow: 1 }}
            size="small"
            placeholder="Buscar por solicitante..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>) } }}
          />
          <Tooltip title={hasActiveFilters ? 'Filtros ativos' : 'Filtrar'}>
            <IconButton onClick={openFilter} sx={{ border: '1px solid', borderColor: hasActiveFilters ? 'primary.main' : 'divider', color: hasActiveFilters ? 'primary.main' : 'action.active', borderRadius: 1 }}>
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : isError ? (
          <Box sx={{ p: 2 }}><Alert severity="error">Erro ao carregar pedidos: {error instanceof Error ? error.message : 'Erro desconhecido'}</Alert></Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.selected' }}>
                    {['SOLICITANTE', 'MATERIAL', 'ARQUIVOS', 'IMPRESSORA', 'STATUS'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', width: 72 }} align="center">AÇÕES</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {printRequests.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>Nenhum pedido de impressão encontrado.</TableCell></TableRow>
                  ) : (
                    printRequests.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, fontSize: '0.85rem', bgcolor: 'primary.light' }}>{item.user.name.charAt(0).toUpperCase()}</Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>{item.user.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.user.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell><Chip label={item.filament.name.toUpperCase()} size="small" /></TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, color: 'text.secondary' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FileIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.stlFile.name}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FileIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.gcodeFile.name}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {item.printer ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PrintIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{item.printer.name}</Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell><PrintRequestStatusChip status={item.status} /></TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalhes"><IconButton size="small" onClick={() => handleOpen(item)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {pagesCount > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Pagination count={pagesCount} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: 2, width: 320, p: 2.5, mt: 0.5 } } }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</Typography>
        <FormGroup sx={{ mt: 0.5, mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <FormControlLabel key={opt.value} control={<Checkbox size="small" checked={pendingStatuses.includes(opt.value)} onChange={() => toggleStatus(opt.value)} />} label={<Typography variant="body2">{opt.label}</Typography>} sx={{ width: '50%', m: 0 }} />
            ))}
          </Box>
        </FormGroup>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Impressora</Typography>
        <Select size="small" fullWidth displayEmpty value={pendingPrinterId} onChange={(e) => setPendingPrinterId(e.target.value)} sx={{ mt: 0.5, mb: 2.5 }}>
          <MenuItem value="">Todas</MenuItem>
          {printers.map((p) => (<MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>))}
        </Select>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button size="small" color="inherit" onClick={clearFilters}>Limpar</Button>
          <Button size="small" variant="contained" onClick={applyFilters}>Aplicar Filtros</Button>
        </Box>
      </Popover>

      <PrintRequestDetailDialog open={isDetailOpen} onClose={() => { setIsDetailOpen(false); setSelected(null); }} printRequest={freshSelected} />
    </Box>
  );
};

export default PrintRequestsPage;
