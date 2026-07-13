import React, { useState } from 'react';
import {
  Box, Typography, Button, Grid, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, TextField, FormControlLabel,
  Switch, Paper, Chip, InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Layers as LayersIcon } from '@mui/icons-material';
import { PrinterCard, type Printer } from '../components/printing/PrinterCard';
import { EditPrinterDialog } from '../components/printing/EditPrinterDialog';
import { usePrinters } from '../hooks/usePrinters';
import { useFilaments } from '../hooks/useFilaments';

const PrintersPage: React.FC = () => {
  const { printers, isLoading, isError, error, findPrinter, createPrinter, isCreating, createError, resetCreateError: resetPrinterCreateError, deletePrinter, isDeleting: isDeletingPrinter } = usePrinters();
  const {
    filaments, isLoading: filamentsLoading,
    createFilament, isCreating: isCreatingFilament, createError: filamentError, resetCreateError,
    deleteFilament, isDeleting: isDeletingFilament,
  } = useFilaments();

  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [printerToDelete, setPrinterToDelete] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createModel, setCreateModel] = useState('Ender 3 V1');
  const [createNotes, setCreateNotes] = useState('');
  const [createEnabled, setCreateEnabled] = useState(true);

  const [newFilament, setNewFilament] = useState('');
  const [filamentToDelete, setFilamentToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleEdit = (id: string) => {
    const printer = findPrinter(id);
    if (printer) {
      setSelectedPrinter(printer);
      setIsEditOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setPrinterToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (printerToDelete) {
      deletePrinter(printerToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPrinterToDelete(null);
        },
        onError: (err) => alert(err instanceof Error ? err.message : 'Erro ao excluir impressora.'),
      });
    }
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createPrinter(
      { name: createName, model: createModel, enabled: createEnabled, notes: createNotes || null },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setCreateName('');
          setCreateModel('Ender 3 V1');
          setCreateNotes('');
          setCreateEnabled(true);
        },
      },
    );
  };

  const handleAddFilament = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFilament.trim();
    if (!name) return;
    createFilament({ name }, { onSuccess: () => setNewFilament('') });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Gerenciar Impressoras
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie as impressoras 3D e os tipos de filamento disponíveis no Locomotiva Hub.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetPrinterCreateError(); setIsCreateOpen(true); }} sx={{ bgcolor: 'primary.main' }}>
          Nova Impressora
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          Erro ao carregar as impressoras: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {printers.map((printer: Printer) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={printer.id}>
              <PrinterCard printer={printer} onEdit={handleEdit} onDelete={handleDelete} />
            </Grid>
          ))}

          {printers.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                Nenhuma impressora encontrada.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {/* Filamentos — catálogo de materiais que o cliente escolhe ao pedir */}
      <Paper sx={{ mt: 4, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <LayersIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Tipos de Filamento</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Estes são os materiais que o usuário pode escolher ao fazer um pedido de impressão.
        </Typography>

        {filamentError && <Alert severity="error" onClose={resetCreateError} sx={{ mb: 2 }}>{filamentError}</Alert>}

        <Box component="form" onSubmit={handleAddFilament} sx={{ display: 'flex', gap: 1.5, mb: 2.5, maxWidth: 420 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Ex.: PETG, ABS, PLA..."
            value={newFilament}
            onChange={(e) => setNewFilament(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LayersIcon fontSize="small" color="disabled" /></InputAdornment> } }}
          />
          <Button type="submit" variant="contained" disabled={isCreatingFilament || newFilament.trim().length < 2} sx={{ whiteSpace: 'nowrap' }}>
            {isCreatingFilament ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </Box>

        {filamentsLoading ? (
          <CircularProgress size={22} />
        ) : filaments.length === 0 ? (
          <Alert severity="warning" sx={{ maxWidth: 560 }}>
            Nenhum filamento cadastrado — o usuário não conseguirá escolher um material. Cadastre pelo menos um.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filaments.map((f) => (
              <Chip
                key={f.id}
                label={f.name.toUpperCase()}
                onDelete={() => setFilamentToDelete(f)}
                sx={{ fontWeight: 600, bgcolor: '#EFF6FF', color: '#1E40AF', '& .MuiChip-deleteIcon': { color: '#93B4D6', '&:hover': { color: '#1E40AF' } } }}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Dialog de Criação de impressora */}
      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0, 0, 0, 0.2)' } },
          paper: { sx: { borderRadius: 2 } },
        }}
      >
        <form onSubmit={handleSubmitCreate}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Nova Impressora</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {createError && <Alert severity="error">{createError}</Alert>}
              <TextField label="Nome da Impressora" variant="outlined" fullWidth value={createName} onChange={(e) => setCreateName(e.target.value)} required />
              <TextField label="Modelo" variant="outlined" fullWidth value={createModel} onChange={(e) => setCreateModel(e.target.value)} required />

              <TextField label="Observações (opcional)" variant="outlined" fullWidth multiline minRows={2} value={createNotes} onChange={(e) => setCreateNotes(e.target.value)} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box>
                  <Typography variant="subtitle2">Status da Impressora</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {createEnabled ? 'A impressora estará disponível para novos pedidos.' : 'A impressora ficará indisponível para novos pedidos.'}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={<Switch checked={createEnabled} onChange={(e) => setCreateEnabled(e.target.checked)} color="success" />}
                  label={createEnabled ? 'Ativa' : 'Inativa'}
                  labelPlacement="start"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsCreateOpen(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" color="primary" disabled={isCreating} startIcon={isCreating ? <CircularProgress size={20} /> : null}>
              {isCreating ? 'Criando...' : 'Criar Impressora'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de Edição */}
      <EditPrinterDialog
        key={selectedPrinter?.id}
        open={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedPrinter(null); }}
        printer={selectedPrinter}
      />

      {/* Dialog de Confirmação de Exclusão de impressora */}
      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setPrinterToDelete(null); }}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta impressora? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setPrinterToDelete(null); }} color="primary">Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isDeletingPrinter}>{isDeletingPrinter ? 'Excluindo...' : 'Excluir'}</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão de filamento */}
      <Dialog open={!!filamentToDelete} onClose={() => setFilamentToDelete(null)}>
        <DialogTitle>Remover Filamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remover o filamento <strong>{filamentToDelete?.name.toUpperCase()}</strong>? Ele deixará de aparecer como opção para novos pedidos (pedidos antigos não são afetados).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilamentToDelete(null)} color="primary">Cancelar</Button>
          <Button
            color="error"
            autoFocus
            disabled={isDeletingFilament}
            onClick={() => filamentToDelete && deleteFilament(filamentToDelete.id, {
              onSuccess: () => setFilamentToDelete(null),
              onError: (err) => alert(err instanceof Error ? err.message : 'Erro ao remover filamento.'),
            })}
          >
            {isDeletingFilament ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrintersPage;
