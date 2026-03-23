import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import { USERS_QUERY_KEY } from '../../hooks/useUsers';

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, onClose }) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const mutation = useMutation({
    mutationFn: (input: { name: string; email: string; cpf: string; birthDate: string; password: string }) =>
      orpc.identy.registerUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      handleClose();
    },
    onError: (err) => {
      console.error('Failed to create user:', err);
    },
  });

  const handleClose = () => {
    setName('');
    setEmail('');
    setCpf('');
    setBirthDate('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setConfirmPasswordError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem.');
      return;
    }
    setConfirmPasswordError('');
    mutation.mutate({ name, email, cpf, birthDate, password });
  };

  const error = mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: { sx: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0, 0, 0, 0.2)' } },
        paper: { sx: { borderRadius: 2 } },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Novo Usuário</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Nome completo"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="CPF"
              fullWidth
              required
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              slotProps={{ htmlInput: { maxLength: 14 } }}
            />

            <TextField
              label="Data de nascimento"
              type="date"
              fullWidth
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Mín. 8 caracteres, com maiúscula, minúscula, número e símbolo."
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword((p) => !p)} edge="end">
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Confirmar senha"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(''); }}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirmPassword((p) => !p)} edge="end">
                        {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
            startIcon={mutation.isPending ? <CircularProgress size={18} /> : null}
          >
            {mutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
