import React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  CalendarMonth as CalendarMonthIcon,
  MeetingRoom as MeetingRoomIcon,
  People as PeopleIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Assessment as AssessmentIcon,
  Print as PrintIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useThemeMode } from '../../contexts/ThemeContext';
import { version } from '../../../package.json';

const drawerWidth = 280;

const menuGroups = [
  {
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    ],
  },
  {
    label: 'COWORKING',
    items: [
      { text: 'Controle de Acesso', icon: <SecurityIcon />, path: '/access-control' },
      { text: 'Histórico', icon: <HistoryIcon />, path: '/access-history' },
    ],
  },
  {
    label: 'RESERVAS',
    items: [
      { text: 'Reservas', icon: <CalendarMonthIcon />, path: '/reservations' },
      { text: 'Salas', icon: <MeetingRoomIcon />, path: '/rooms' },
    ],
  },
  {
    label: 'IMPRESSÃO 3D',
    items: [
      { text: 'Pedidos de Impressão', icon: <PrintIcon />, path: '/print-requests' },
      { text: 'Impressoras', icon: <LayersIcon />, path: '/printers' },
    ],
  },
  {
    label: 'ADMIN',
    items: [
      { text: 'Usuários', icon: <PeopleIcon />, path: '/users' },
      //{ text: 'Relatório de Frequência', icon: <BarChartIcon />, path: '/frequency-report' },
      { text: 'Relatório', icon: <AssessmentIcon />, path: '/report' },
    ],
  },
];

const bottomItems = [
  { text: 'Configurações', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Sair', icon: <LogoutIcon />, action: 'logout' },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useCurrentUser();
  const { mode, toggleTheme } = useThemeMode();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Sem isto, os dados do usuário anterior seguem em cache na próxima sessão.
    queryClient.clear();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: 'background.default',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {isLoading ? '...' : (user?.name ?? 'Admin')}
            </Typography>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
              {isLoading ? '?' : (user?.name?.charAt(0).toUpperCase() ?? 'A')}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Box
            component="img"
            src="/locomotiva_logo-.png"
            alt="Locomotiva Hub"
            sx={{ height: 60, maxWidth: '100%', objectFit: 'contain' }}
          />
        </Toolbar>
        <Divider />

        <List sx={{ flexGrow: 1 }}>
          {menuGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {group.label && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    px: 2,
                    pt: groupIndex === 0 ? 1 : 2,
                    pb: 0.5,
                    color: 'text.disabled',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    fontSize: '0.65rem',
                  }}
                >
                  {group.label}
                </Typography>
              )}
              {group.items.map((item) => {
                const selected = location.pathname === item.path;
                return (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      selected={selected}
                      onClick={() => navigate(item.path)}
                      sx={{
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                          '&:hover': { bgcolor: 'primary.dark' },
                        },
                        borderRadius: 2,
                        mx: 1,
                        my: 0.5,
                      }}
                    >
                      <ListItemIcon sx={{ color: selected ? 'inherit' : 'text.secondary' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </React.Fragment>
          ))}
        </List>

        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', textAlign: 'center', display: 'block', pb: 1 }}
        >
          v{version}
        </Typography>

        <Divider />

        <List>
          {bottomItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={selected}
                  onClick={() =>
                    item.action === 'logout' ? handleLogout() : navigate(item.path!)
                  }
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                  }}
                >
                  <ListItemIcon sx={{ color: selected ? 'inherit' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
