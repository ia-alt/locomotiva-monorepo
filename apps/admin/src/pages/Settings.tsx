import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Switch,
  CircularProgress, Alert, Divider, Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../services/api';
import { useCurrentUser, CURRENT_USER_QUERY_KEY } from '../hooks/useCurrentUser';
import { useThemeMode } from '../contexts/ThemeContext';

// ─── Profile ────────────────────────────────────────────────────────────────

const ProfileSection: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, isLoading } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const startEdit = () => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setCpf(user?.cpf ?? '');
    setBirthDate(user?.birthDate ?? '');
    setEditing(true);
  };

  const mutation = useMutation({
    mutationFn: () =>
      orpc.identy.updateUser({
        userId: user!.id,
        data: {
          name,
          email,
          cpf,
          birthDate,
          userType: user!.userType as 'user' | 'admin' | 'system',
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      setEditing(false);
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      {mutation.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {mutation.error instanceof Error ? mutation.error.message : 'Erro ao salvar'}
        </Alert>
      )}

      {!editing ? (
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Box sx={{ display: 'flex', gap: 4, mt: 1.5, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                  CPF
                </Typography>
                <Typography variant="body2">{user?.cpf ?? '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                  Data de Nascimento
                </Typography>
                <Typography variant="body2">
                  {user?.birthDate
                    ? new Date(user.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')
                    : '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                  Tipo
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {user?.userType ?? '—'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button startIcon={<EditIcon />} onClick={startEdit} variant="outlined" size="small">
            Editar
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}>
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="Data de Nascimento"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => setEditing(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !name || !email}
              startIcon={mutation.isPending ? <CircularProgress size={16} /> : null}
            >
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ─── Change Password ─────────────────────────────────────────────────────────

const ChangePasswordSection: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => orpc.identy.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
  });

  const passwordMismatch = confirmPassword !== '' && newPassword !== confirmPassword;
  const canSubmit =
    currentPassword && newPassword && confirmPassword && !passwordMismatch && !mutation.isPending;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}>
      {mutation.isSuccess && <Alert severity="success">Senha alterada com sucesso!</Alert>}
      {mutation.error && (
        <Alert severity="error">
          {mutation.error instanceof Error ? mutation.error.message : 'Erro ao alterar senha'}
        </Alert>
      )}
      <TextField
        label="Senha atual"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        size="small"
        fullWidth
      />
      <TextField
        label="Nova senha"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        size="small"
        fullWidth
      />
      <TextField
        label="Confirmar nova senha"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        size="small"
        fullWidth
        error={passwordMismatch}
        helperText={passwordMismatch ? 'As senhas não coincidem' : ''}
      />
      <Box>
        <Button
          variant="contained"
          onClick={() => mutation.mutate()}
          disabled={!canSubmit}
          startIcon={mutation.isPending ? <CircularProgress size={16} /> : null}
        >
          {mutation.isPending ? 'Alterando...' : 'Alterar Senha'}
        </Button>
      </Box>
    </Box>
  );
};

// ─── Appearance ──────────────────────────────────────────────────────────────

const AppearanceSection: React.FC = () => {
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 480 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {isDark ? <DarkModeIcon color="primary" /> : <LightModeIcon color="primary" />}
        <Box>
          <Typography variant="body1" fontWeight={500}>
            Modo {isDark ? 'Escuro' : 'Claro'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isDark ? 'Interface em tema escuro' : 'Interface em tema claro'}
          </Typography>
        </Box>
      </Box>
      <Switch checked={isDark} onChange={toggleTheme} color="primary" />
    </Box>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

const SettingsSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography variant="h6" fontWeight={600}>{title}</Typography>
    </Box>
    <Divider sx={{ mb: 2.5 }} />
    {children}
  </Paper>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const SettingsPage: React.FC = () => (
  <Box sx={{ p: 3, maxWidth: 720 }}>
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={0.5}>Configurações</Typography>
      <Typography variant="body1" color="text.secondary">
        Gerencie seu perfil e preferências do sistema.
      </Typography>
    </Box>

    <SettingsSection icon={<PersonIcon />} title="Meu Perfil">
      <ProfileSection />
    </SettingsSection>

    <SettingsSection icon={<LockIcon />} title="Segurança">
      <ChangePasswordSection />
    </SettingsSection>

    <SettingsSection icon={<PaletteIcon />} title="Aparência">
      <AppearanceSection />
    </SettingsSection>
  </Box>
);

export default SettingsPage;
