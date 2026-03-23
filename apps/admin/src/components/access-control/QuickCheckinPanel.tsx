import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Search as SearchIcon, HowToReg as CheckinIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import { useUsers, type UserItem } from '../../hooks/useUsers';
import { ACTIVE_ACCESS_LOGS_QUERY_KEY } from '../../hooks/useActiveAccessLogs';

export const QuickCheckinPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { users, isLoading: isSearching } = useUsers(1, 5, search);

  const checkinMutation = useMutation({
    mutationFn: (userId: string) => orpc.coworking.adminCheckin({ userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ACTIVE_ACCESS_LOGS_QUERY_KEY] });
      setSuccessMessage(`Check-in de ${selectedUser?.name} realizado com sucesso!`);
      setSelectedUser(null);
      setSearch('');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err) => {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao realizar check-in');
    },
  });

  const handleSelectUser = (user: UserItem) => {
    setSelectedUser(user);
    setSearch('');
    setErrorMessage(null);
  };

  const handleCheckin = () => {
    if (!selectedUser) return;
    checkinMutation.mutate(selectedUser.id);
  };

  const showDropdown = search.length >= 2 && !selectedUser;

  return (
    <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Check-in Rápido
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Busque um usuário pelo nome ou e-mail para realizar o check-in manualmente.
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, position: 'relative' }}>
          {selectedUser ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                border: '1px solid',
                borderColor: 'primary.main',
                borderRadius: 1,
                bgcolor: 'primary.50',
              }}
            >
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                {selectedUser.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={500}>
                  {selectedUser.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedUser.email}
                </Typography>
              </Box>
              <Button
                size="small"
                color="inherit"
                onClick={() => setSelectedUser(null)}
                sx={{ minWidth: 0, px: 1 }}
              >
                ×
              </Button>
            </Box>
          ) : (
            <TextField
              fullWidth
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: isSearching && search.length >= 2 ? (
                    <InputAdornment position="end">
                      <CircularProgress size={18} />
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          )}

          {showDropdown && users.length > 0 && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 10,
                mt: 0.5,
                maxHeight: 260,
                overflow: 'auto',
              }}
            >
              <List dense disablePadding>
                {users.map((user) => (
                  <ListItemButton key={user.id} onClick={() => handleSelectUser(user)}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.light' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.email}
                      slotProps={{ primary: { variant: 'body2' }, secondary: { variant: 'caption' } }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}

          {showDropdown && !isSearching && users.length === 0 && (
            <Paper elevation={4} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, mt: 0.5, p: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Nenhum usuário encontrado.
              </Typography>
            </Paper>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={checkinMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <CheckinIcon />}
          disabled={!selectedUser || checkinMutation.isPending}
          onClick={handleCheckin}
          sx={{ height: 56, px: 3, flexShrink: 0 }}
        >
          {checkinMutation.isPending ? 'Realizando...' : 'Fazer Check-in'}
        </Button>
      </Box>
    </Paper>
  );
};
