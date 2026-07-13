import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  Button, TextField, Typography, Box, CircularProgress, Alert,
  IconButton, Select, MenuItem, Tooltip, Link,
} from '@mui/material';
import {
  Close,
  Edit as EditIcon,
  PersonOutlined,
  ScienceOutlined,
  DescriptionOutlined,
  PrintOutlined,
  DownloadOutlined,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import { PRINT_REQUESTS_ADMIN_QUERY_KEY, type PrintRequestAdminItem } from '../../hooks/usePrintRequestsAdmin';

type Mode = 'view' | 'allocating' | 'rejecting' | 'cancelling' | 'discarding';

interface PrintRequestDetailDialogProps {
  open: boolean;
  onClose: () => void;
  printRequest: PrintRequestAdminItem | null;
}

const STATUS_BADGE: Record<string, { label: string; dot: string; bg: string; border: string; text: string }> = {
  pending:       { label: 'Em análise',         dot: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  approved:      { label: 'Aprovado',           dot: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  in_production: { label: 'Em produção',        dot: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  completed:     { label: 'Pronto p/ retirada', dot: '#0d9488', bg: '#f0fdfa', border: '#99f6e4', text: '#115e59' },
  delivered:     { label: 'Entregue',           dot: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', text: '#14532d' },
  discarded:     { label: 'Descartado',         dot: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', text: '#374151' },
  rejected:      { label: 'Recusado',           dot: '#ef4444', bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
  cancelled:     { label: 'Cancelado',          dot: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6' },
};

const IconLabel: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
    {icon}{children}
  </Typography>
);

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// createdAt é um timestamp puro de auditoria (mesmo tratamento do booking).
const formatCreatedAt = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const FileBlock: React.FC<{
  label: string;
  file: { name: string; sizeBytes: number; deleted: boolean };
  onDownload: () => void;
  downloading: boolean;
}> = ({ label, file, onDownload, downloading }) => (
  <Box>
    <IconLabel icon={<DescriptionOutlined sx={{ fontSize: 13 }} />}>{label}</IconLabel>
    {file.deleted ? (
      // exclusão lógica: o registro fica, mas o arquivo saiu do bucket — sem download
      <Typography sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 14, fontWeight: 500, color: '#9ca3af', wordBreak: 'break-all' }}>
        <DescriptionOutlined sx={{ fontSize: 15 }} />
        {file.name} · removido
      </Typography>
    ) : (
      <Link
        component="button"
        type="button"
        onClick={onDownload}
        disabled={downloading}
        underline="hover"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 14, fontWeight: 500, wordBreak: 'break-all', textAlign: 'left', cursor: 'pointer' }}
      >
        {downloading ? <CircularProgress size={12} /> : <DownloadOutlined sx={{ fontSize: 15 }} />}
        {file.name}
      </Link>
    )}
    {file.sizeBytes ? (<Typography sx={{ fontSize: 12, color: '#94a3b8' }}>{formatFileSize(file.sizeBytes)}</Typography>) : null}
  </Box>
);

export const PrintRequestDetailDialog: React.FC<PrintRequestDetailDialogProps> = ({ open, onClose, printRequest }) => {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>('view');
  const [reason, setReason] = useState('');
  const [printerId, setPrinterId] = useState('');

  const { data: printers = [] } = useQuery({
    queryKey: ['printers'],
    queryFn: () => orpc.printing.listPrinters({}),
    enabled: open,
    staleTime: 60_000,
  });
  const enabledPrinters = (printers as { id: string; name: string; enabled: boolean; inUse?: boolean }[]).filter((p) => p.enabled);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: PRINT_REQUESTS_ADMIN_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ['printers'] });
  };

  const processMutation = useMutation({
    mutationFn: (params: { printRequestId: string; decision: { type: 'approve' } | { type: 'reject'; reason: string } }) =>
      orpc.printing.processPrintRequest(params),
    onSuccess: () => { invalidate(); handleClose(); },
  });

  // alocar NÃO fecha o dialog — o técnico vincula e já inicia a produção em seguida
  const allocateMutation = useMutation({
    mutationFn: (params: { printRequestId: string; printerId: string }) => orpc.printing.allocatePrinter(params),
    onSuccess: () => { invalidate(); setMode('view'); setPrinterId(''); },
  });

  const cancelMutation = useMutation({
    mutationFn: (params: { printRequestId: string; reason: string }) => orpc.printing.adminCancelPrintRequest(params),
    onSuccess: () => { invalidate(); handleClose(); },
  });

  const startProductionMutation = useMutation({
    mutationFn: (printRequestId: string) => orpc.printing.startPrintProduction({ printRequestId }),
    onSuccess: () => { invalidate(); handleClose(); },
  });

  const completeMutation = useMutation({
    mutationFn: (printRequestId: string) => orpc.printing.completePrintRequest({ printRequestId }),
    onSuccess: () => { invalidate(); handleClose(); },
  });

  const deliverMutation = useMutation({
    mutationFn: (printRequestId: string) => orpc.printing.deliverPrintRequest({ printRequestId }),
    onSuccess: () => { invalidate(); handleClose(); },
  });

  const discardMutation = useMutation({
    mutationFn: (params: { printRequestId: string; reason: string }) => orpc.printing.discardPrintRequest(params),
    onSuccess: () => { invalidate(); handleClose(); },
  });

  // download seguro (presigned GET): NÃO entra no `busy` geral nem fecha o dialog
  const downloadMutation = useMutation({
    mutationFn: (params: { printRequestId: string; file: 'stl' | 'gcode' }) => orpc.printing.createPrintFileDownloadUrl(params),
    onSuccess: (res) => { window.open(res.downloadUrl, '_blank', 'noopener'); },
  });

  const mutations = [processMutation, allocateMutation, cancelMutation, startProductionMutation, completeMutation, deliverMutation, discardMutation];

  const handleClose = () => {
    setMode('view');
    setReason('');
    setPrinterId('');
    mutations.forEach((m) => m.reset());
    onClose();
  };

  const backToView = () => {
    setMode('view');
    setReason('');
    mutations.forEach((m) => m.reset());
  };

  const startAllocating = () => {
    // só pré-seleciona se a impressora atual ainda estiver habilitada (senão o Select ficaria inconsistente)
    const currentId = printRequest?.printer?.id ?? '';
    setPrinterId(enabledPrinters.some((p) => p.id === currentId) ? currentId : '');
    setMode('allocating');
  };

  if (!printRequest) return null;

  const isPending = printRequest.status === 'pending';
  const isApproved = printRequest.status === 'approved';
  const isInProduction = printRequest.status === 'in_production';
  const isCompleted = printRequest.status === 'completed';
  const canEditPrinter = isApproved || isInProduction; // depois de finalizado, não muda mais
  const isCancellable = isApproved || isInProduction;
  const busy = mutations.some((m) => m.isPending);
  const error = mutations.map((m) => (m.error instanceof Error ? m.error.message : null)).find(Boolean) ?? null;
  const badge = STATUS_BADGE[printRequest.status] ?? { label: printRequest.status, dot: '#9ca3af', bg: '#f9fafb', border: '#e5e7eb', text: '#4b5563' };

  const handleDownload = (file: 'stl' | 'gcode') => downloadMutation.mutate({ printRequestId: printRequest.id, file });
  const handleAllocate = () => { if (printerId) allocateMutation.mutate({ printRequestId: printRequest.id, printerId }); };
  const handleReject = () => { if (reason.trim()) processMutation.mutate({ printRequestId: printRequest.id, decision: { type: 'reject', reason: reason.trim() } }); };
  const handleCancel = () => { if (reason.trim()) cancelMutation.mutate({ printRequestId: printRequest.id, reason: reason.trim() }); };
  const handleDiscard = () => { if (reason.trim()) discardMutation.mutate({ printRequestId: printRequest.id, reason: reason.trim() }); };

  return (
    <Dialog
      open={open}
      onClose={() => { if (!busy) handleClose(); }}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: { sx: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0,0,0,0.25)' } },
        paper: { sx: { borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } },
      }}
    >
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.01em' }}>Pedido de Impressão 3D</Typography>
        <IconButton onClick={handleClose} size="small" disabled={busy} sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f8fafc' } }}><Close fontSize="small" /></IconButton>
      </Box>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status Atual</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, bgcolor: badge.bg, border: `1px solid ${badge.border}`, borderRadius: 99 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: badge.dot, animation: 'statusPulse 2s infinite', '@keyframes statusPulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.35 } } }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: badge.text }}>{badge.label}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <Box>
            <IconLabel icon={<PersonOutlined sx={{ fontSize: 13 }} />}>Solicitante</IconLabel>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{printRequest.user.name}</Typography>
            <Typography sx={{ fontSize: 13, color: '#64748b' }}>{printRequest.user.email}</Typography>
          </Box>
          <Box>
            <IconLabel icon={<ScienceOutlined sx={{ fontSize: 13 }} />}>Material</IconLabel>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{printRequest.material.toUpperCase()}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <FileBlock label="Modelo 3D (.stl)" file={printRequest.stlFile} onDownload={() => handleDownload('stl')} downloading={downloadMutation.isPending && downloadMutation.variables?.file === 'stl'} />
          <FileBlock label="Fatiado (.gcode)" file={printRequest.gcodeFile} onDownload={() => handleDownload('gcode')} downloading={downloadMutation.isPending && downloadMutation.variables?.file === 'gcode'} />
        </Box>

        {/* Impressora vinculada — só existe depois do aceite */}
        {!isPending && (
          <Box sx={{ bgcolor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 2.5, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <IconLabel icon={<PrintOutlined sx={{ fontSize: 13 }} />}>Impressora vinculada</IconLabel>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: printRequest.printer ? '#1e293b' : '#94a3b8' }}>
                  {printRequest.printer?.name ?? 'Nenhuma impressora vinculada'}
                </Typography>
              </Box>
              {canEditPrinter && mode === 'view' && (
                <Tooltip title={printRequest.printer ? 'Trocar impressora' : 'Vincular impressora'}>
                  <IconButton size="small" onClick={startAllocating} disabled={busy} sx={{ color: '#2563eb', bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {mode === 'allocating' && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Select size="small" fullWidth displayEmpty value={printerId} onChange={(e) => setPrinterId(e.target.value)} sx={{ bgcolor: 'white' }}>
                  <MenuItem value="" disabled>Escolha a impressora</MenuItem>
                  {enabledPrinters.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}{p.inUse ? ' · em uso agora' : ''}</MenuItem>
                  ))}
                </Select>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={backToView} disabled={busy} sx={{ color: '#64748b', fontWeight: 600 }}>Cancelar</Button>
                  <Button size="small" variant="contained" onClick={handleAllocate} disabled={busy || !printerId} startIcon={allocateMutation.isPending ? <CircularProgress size={14} sx={{ color: 'white' }} /> : null} sx={{ fontWeight: 600 }}>
                    {allocateMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        <Box>
          <IconLabel icon={<DescriptionOutlined sx={{ fontSize: 13 }} />}>Motivo da impressão</IconLabel>
          <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, p: 1.5, bgcolor: 'white' }}>
            <Typography sx={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{printRequest.purpose}</Typography>
          </Box>
        </Box>

        {printRequest.rejectionCancelReason && (
          <Box sx={{ bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 1.5, p: 1.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>Motivo da recusa / cancelamento / descarte</Typography>
            <Typography sx={{ fontSize: 14, color: '#475569' }}>{printRequest.rejectionCancelReason}</Typography>
          </Box>
        )}

        {(mode === 'rejecting' || mode === 'cancelling' || mode === 'discarding') && (
          <TextField
            label={mode === 'rejecting' ? 'Motivo da recusa' : mode === 'cancelling' ? 'Motivo do cancelamento' : 'Motivo do descarte'}
            fullWidth required multiline rows={2} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        )}

        <Box sx={{ pt: 2, borderTop: '1px solid #f1f5f9' }}>
          <Typography sx={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Solicitado em {formatCreatedAt(printRequest.createdAt)}</Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {(mode === 'view' || mode === 'allocating') && (
          <>
            {isCancellable && (<Button onClick={() => setMode('cancelling')} disabled={busy} sx={{ mr: 'auto', color: '#64748b', fontWeight: 600, borderRadius: 2 }}>Cancelar pedido</Button>)}
            {isPending && (
              <>
                <Button variant="outlined" onClick={() => setMode('rejecting')} disabled={busy} sx={{ fontWeight: 600, color: '#e11d48', borderColor: '#fecdd3', borderRadius: 2, '&:hover': { bgcolor: '#fff1f2', borderColor: '#fda4af' } }}>Recusar</Button>
                <Button variant="contained" onClick={() => processMutation.mutate({ printRequestId: printRequest.id, decision: { type: 'approve' } })} disabled={busy} startIcon={processMutation.isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null} sx={{ fontWeight: 600, bgcolor: '#16a34a', borderRadius: 2, '&:hover': { bgcolor: '#15803d' } }}>
                  {processMutation.isPending ? 'Aceitando...' : 'Aceitar'}
                </Button>
              </>
            )}
            {isApproved && (
              <Tooltip title={printRequest.printer ? '' : 'Vincule uma impressora antes de iniciar a produção'}>
                <span>
                  <Button variant="contained" onClick={() => startProductionMutation.mutate(printRequest.id)} disabled={busy || !printRequest.printer} startIcon={startProductionMutation.isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null} sx={{ fontWeight: 600, bgcolor: '#2563eb', borderRadius: 2, '&:hover': { bgcolor: '#1d4ed8' } }}>
                    {startProductionMutation.isPending ? 'Iniciando...' : 'Iniciar produção'}
                  </Button>
                </span>
              </Tooltip>
            )}
            {isInProduction && (
              <Button variant="contained" onClick={() => completeMutation.mutate(printRequest.id)} disabled={busy} startIcon={completeMutation.isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null} sx={{ fontWeight: 600, bgcolor: '#0d9488', borderRadius: 2, '&:hover': { bgcolor: '#0f766e' } }}>
                {completeMutation.isPending ? 'Finalizando...' : 'Finalizado'}
              </Button>
            )}
            {isCompleted && (
              <>
                <Button variant="outlined" onClick={() => setMode('discarding')} disabled={busy} sx={{ fontWeight: 600, color: '#4b5563', borderColor: '#d1d5db', borderRadius: 2, '&:hover': { bgcolor: '#f9fafb', borderColor: '#9ca3af' } }}>Descartado</Button>
                <Button variant="contained" onClick={() => deliverMutation.mutate(printRequest.id)} disabled={busy} startIcon={deliverMutation.isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null} sx={{ fontWeight: 600, bgcolor: '#16a34a', borderRadius: 2, '&:hover': { bgcolor: '#15803d' } }}>
                  {deliverMutation.isPending ? 'Registrando...' : 'Entregue'}
                </Button>
              </>
            )}
          </>
        )}

        {mode === 'rejecting' && (
          <>
            <Button onClick={backToView} disabled={busy} sx={{ color: '#64748b', fontWeight: 600, borderRadius: 2 }}>Voltar</Button>
            <Button variant="contained" onClick={handleReject} disabled={busy || !reason.trim()} startIcon={busy ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null} sx={{ fontWeight: 600, bgcolor: '#dc2626', borderRadius: 2, '&:hover': { bgcolor: '#b91c1c' } }}>
              {busy ? 'Recusando...' : 'Confirmar Recusa'}
            </Button>
          </>
        )}

        {mode === 'cancelling' && (
          <>
            <Button onClick={backToView} disabled={busy} sx={{ color: '#64748b', fontWeight: 600, borderRadius: 2 }}>Voltar</Button>
            <Button variant="contained" onClick={handleCancel} disabled={busy || !reason.trim()} startIcon={busy ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null} sx={{ fontWeight: 600, bgcolor: '#dc2626', borderRadius: 2, '&:hover': { bgcolor: '#b91c1c' } }}>
              {busy ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </>
        )}

        {mode === 'discarding' && (
          <>
            <Button onClick={backToView} disabled={busy} sx={{ color: '#64748b', fontWeight: 600, borderRadius: 2 }}>Voltar</Button>
            <Button variant="contained" onClick={handleDiscard} disabled={busy || !reason.trim()} startIcon={busy ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null} sx={{ fontWeight: 600, bgcolor: '#4b5563', borderRadius: 2, '&:hover': { bgcolor: '#374151' } }}>
              {busy ? 'Registrando...' : 'Confirmar Descarte'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
