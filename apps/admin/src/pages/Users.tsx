import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useUsers, type UserItem } from '../hooks/useUsers';
import { CreateUserDialog } from '../components/users/CreateUserDialog';
import { EditUserDialog } from '../components/users/EditUserDialog';
import { DeleteUserDialog } from '../components/users/DeleteUserDialog';

const PAGE_SIZE = 10;

const USER_TYPE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  user: 'Cidadão',
  system: 'Sistema',
};

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; userId: string } | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { users, pagesCount, isLoading, isError, error } = useUsers(page, PAGE_SIZE, search);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleOpenEdit = (userId: string) => {
    const user = users.find((u: UserItem) => u.id === userId) ?? null;
    setSelectedUser(user);
    setMenuAnchor(null);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (userId: string) => {
    const user = users.find((u: UserItem) => u.id === userId) ?? null;
    setSelectedUser(user);
    setMenuAnchor(null);
    setIsDeleteOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Gestão de Usuários
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administre o acesso e as permissões dos membros da plataforma.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: 'primary.main' }} onClick={() => setIsCreateOpen(true)}>
          Novo Usuário
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={handleSearchChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
        />
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          Erro ao carregar os usuários: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Alert>
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', width: 72 }}>
                    AVATAR
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                    NOME
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                    E-MAIL
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                    TIPO
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', width: 64 }}
                    align="right"
                  >
                    AÇÕES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      {search ? 'Nenhum usuário encontrado para esta busca.' : 'Nenhum usuário encontrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Avatar sx={{ width: 38, height: 38, fontSize: '0.9rem', bgcolor: 'primary.light' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {user.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={USER_TYPE_LABEL[user.userType] ?? user.userType}
                          color={user.userType === 'admin' ? 'primary' : 'default'}
                          size="small"
                          variant={user.userType === 'admin' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => setMenuAnchor({ el: e.currentTarget, userId: user.id })}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagesCount > 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Pagination
                count={pagesCount}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => menuAnchor && handleOpenEdit(menuAnchor.userId)}>Editar</MenuItem>
        <MenuItem onClick={() => menuAnchor && handleOpenDelete(menuAnchor.userId)} sx={{ color: 'error.main' }}>
          Excluir
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <CreateUserDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditUserDialog
        key={selectedUser?.id}
        open={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedUser(null); }}
        user={selectedUser}
      />

      <DeleteUserDialog
        open={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedUser(null); }}
        userId={selectedUser?.id ?? ''}
        userName={selectedUser?.name ?? ''}
      />
    </Box>
  );
};

export default UsersPage;
