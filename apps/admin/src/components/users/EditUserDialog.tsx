import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import { USERS_QUERY_KEY, type UserItem } from '../../hooks/useUsers';

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserItem | null;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, onClose, user }) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [userType, setUserType] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setCpf(formatCpf(user.cpf));
      setBirthDate(user.birthDate);
      setPhone(formatPhone(user.phone ?? ''));
      setCompany(user.company ?? '');
      setJobTitle(user.jobTitle ?? '');
      setUserType(user.userType === 'system' ? 'admin' : user.userType);
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (input: { userId: string; data: { name: string; email: string; cpf: string; birthDate: string; userType: 'user' | 'admin'; company?: string | null; jobTitle?: string | null; phone?: string | null } }) =>
      orpc.identy.updateUser(input as Parameters<typeof orpc.identy.updateUser>[0]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      onClose();
    },
    onError: (err) => {
      console.error('Failed to update user:', err);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    mutation.mutate({ userId: user.id, data: { name, email, cpf, birthDate, userType, company: company || null, jobTitle: jobTitle || null, phone: phone || null } });
  };

  const error = mutation.error instanceof Error ? mutation.error.message : null;

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
        <DialogTitle sx={{ fontWeight: 'bold' }}>Editar Usuário</DialogTitle>
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
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Telefone"
              fullWidth
              value={phone}
              required
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              slotProps={{ htmlInput: { maxLength: 15 } }}
            />

            <TextField
              label="Empresa/Instituição (opcional)"
              fullWidth
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <TextField
              label="Cargo (opcional)"
              fullWidth
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />

            <FormControl fullWidth required>
              <InputLabel>Tipo de usuário</InputLabel>
              <Select
                native
                value={userType}
                onChange={(e) => setUserType(e.target.value as 'user' | 'admin' )}
                label="Tipo de usuário"
              >
                <option value="user">Cidadão</option>
                <option value="admin">Administrador</option>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
            startIcon={mutation.isPending ? <CircularProgress size={18} /> : null}
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
