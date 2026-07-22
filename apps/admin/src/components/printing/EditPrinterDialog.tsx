import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import type { Printer } from './PrinterCard';

interface EditPrinterDialogProps {
  open: boolean;
  onClose: () => void;
  printer: Printer | null;
}

export const EditPrinterDialog: React.FC<EditPrinterDialogProps> = ({ open, onClose, printer }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(printer?.name || '');
  const [model, setModel] = useState(printer?.model || '');
  const [notes, setNotes] = useState(printer?.notes || '');
  const [enabled, setEnabled] = useState<boolean>(printer?.enabled ?? true);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: async (input: { id: string; name: string; model: string; notes: string; enabled: boolean }) => {
      await orpc.printing.updatePrinter({
        id: input.id,
        name: input.name,
        model: input.model,
        notes: input.notes || null,
      });

      if (printer?.enabled !== input.enabled) {
        await orpc.printing.setPrinterEnabled({ id: input.id, enabled: input.enabled });
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      onClose();
      setError(null);
    },
    onError: (err) => {
      console.error('Failed to update printer:', err);
      setError(err instanceof Error ? err.message : 'Falha ao atualizar impressora');
      // o update pode ter aplicado parcialmente (update OK, setEnabled falhou) — sincroniza a lista
      queryClient.invalidateQueries({ queryKey: ['printers'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!printer) return;
    updateMutation.mutate({ id: printer.id, name, model, notes, enabled });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: { sx: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0, 0, 0, 0.2)' } },
        paper: { sx: { borderRadius: 2 } },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Editar Impressora</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField label="Nome da Impressora" variant="outlined" fullWidth value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField label="Modelo" variant="outlined" fullWidth value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ender 3 V1" required />

            <TextField label="Observações (opcional)" variant="outlined" fullWidth multiline minRows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Box>
                <Typography variant="subtitle2">Status da Impressora</Typography>
                <Typography variant="caption" color="text.secondary">
                  {enabled ? 'A impressora está disponível para novos pedidos.' : 'A impressora está indisponível para novos pedidos.'}
                </Typography>
              </Box>
              <FormControlLabel
                control={<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} color="success" />}
                label={enabled ? 'Ativa' : 'Inativa'}
                labelPlacement="start"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" color="primary" disabled={updateMutation.isPending} startIcon={updateMutation.isPending ? <CircularProgress size={20} /> : null}>
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
