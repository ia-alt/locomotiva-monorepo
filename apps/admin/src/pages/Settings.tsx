import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper,
  CircularProgress, Alert, Divider, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Tooltip,
} from '@mui/material';
import {
  Key as KeyIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../services/api';

const API_KEYS_QUERY_KEY = ['apiKeys'];

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [plainKey, setPlainKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: API_KEYS_QUERY_KEY,
    queryFn: () => orpc.identy.listApiKeys(),
  });

  const createMutation = useMutation({
    mutationFn: () => orpc.identy.createApiKey({ name: newKeyName }),
    onSuccess: (result) => {
      setPlainKey(result.plainKey);
      setNewKeyName('');
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => orpc.identy.revokeApiKey({ id }),
    onSuccess: () => {
      setKeyToRevoke(null);
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
    },
  });

  const handleCopy = () => {
    if (!plainKey) return;
    navigator.clipboard.writeText(plainKey);
    setCopied(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 720 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" mb={0.5}>Configurações</Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie as API Keys do sistema.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ color: 'primary.main', display: 'flex' }}><KeyIcon /></Box>
          <Typography variant="h6" fontWeight={600}>API Keys</Typography>
        </Box>
        <Divider sx={{ mb: 2.5 }} />

        {/* Form para criar nova key */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, maxWidth: 480 }}>
          <TextField
            label="Nome da chave (ex: Totem Portaria)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            size="small"
            fullWidth
          />
          <Button
            variant="contained"
            startIcon={createMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            onClick={() => createMutation.mutate()}
            disabled={!newKeyName.trim() || createMutation.isPending}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Criar
          </Button>
        </Box>

        {createMutation.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {createMutation.error instanceof Error ? createMutation.error.message : 'Erro ao criar chave'}
          </Alert>
        )}

        {/* Lista de keys */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : data?.apiKeys.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma API Key cadastrada.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Criada em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.apiKeys.map((key: { id: string; name: string; createdAt: Date }) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <KeyIcon fontSize="small" color="action" />
                      <Typography variant="body2">{key.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={new Date(key.createdAt).toLocaleDateString('pt-BR')}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Revogar chave">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setKeyToRevoke({ id: key.id, name: key.name })}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Modal de confirmação de revogação */}
      <Dialog open={!!keyToRevoke} onClose={() => setKeyToRevoke(null)}>
        <DialogTitle>Revogar API Key</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja revogar a chave <strong>"{keyToRevoke?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Qualquer serviço usando esta chave perderá acesso imediatamente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKeyToRevoke(null)} disabled={revokeMutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => keyToRevoke && revokeMutation.mutate(keyToRevoke.id)}
            disabled={revokeMutation.isPending}
            startIcon={revokeMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {revokeMutation.isPending ? 'Revogando...' : 'Revogar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal mostrando a plainKey uma única vez */}
      <Dialog open={!!plainKey} onClose={() => { setPlainKey(null); setCopied(false); }} maxWidth="sm" fullWidth>
        <DialogTitle>Chave criada com sucesso</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Copie esta chave agora. Ela não será exibida novamente.
          </Alert>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              wordBreak: 'break-all',
            }}
          >
            <Box sx={{ flex: 1 }}>{plainKey}</Box>
            <Tooltip title={copied ? 'Copiado!' : 'Copiar'}>
              <IconButton size="small" onClick={handleCopy} color={copied ? 'success' : 'default'}>
                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => { setPlainKey(null); setCopied(false); }}>
            Entendi, já copiei
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de confirmação de cópia */}
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Chave copiada para a área de transferência"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default SettingsPage;
