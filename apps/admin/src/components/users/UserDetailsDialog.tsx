import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Button,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { type UserItem } from '../../hooks/useUsers';

const USER_TYPE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  user: 'Cidadão',
};

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserItem | null;
  onEdit: () => void;
  onDelete: () => void;
}

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ mt: 0.25 }} color={value ? 'text.primary' : 'text.disabled'}>
      {value ?? 'Não informado'}
    </Typography>
  </Box>
);

const formatCpf = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatBirthDate = (date: string) => {
  if (!date) return null;
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
};

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  open,
  onClose,
  user,
  onEdit,
  onDelete,
}) => {
  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: { sx: { backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0,0,0,0.25)' } },
        paper: { sx: { borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } },
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 3,
        py: 2.5,
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'white',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 44, height: 44, fontSize: '1.1rem', bgcolor: 'primary.light' }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {user.name}
            </Typography>
            <Chip
              label={USER_TYPE_LABEL[user.userType] ?? user.userType}
              color={user.userType === 'admin' ? 'primary' : 'default'}
              size="small"
              variant={user.userType === 'admin' ? 'filled' : 'outlined'}
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon fontSize="small" />}
            onClick={onEdit}
          >
            Editar
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon fontSize="small" />}
            onClick={onDelete}
          >
            Excluir
          </Button>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f8fafc' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <DetailRow label="E-mail" value={user.email} />
          <DetailRow label="CPF" value={formatCpf(user.cpf)} />
          <DetailRow label="Data de nascimento" value={formatBirthDate(user.birthDate)} />
          <DetailRow label="Telefone" value={user.phone} />
          <Divider />
          <DetailRow label="Empresa/Instituição" value={user.company} />
          <DetailRow label="Cargo" value={user.jobTitle} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
