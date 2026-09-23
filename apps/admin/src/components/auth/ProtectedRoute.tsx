import { encerrarSessao } from '../../services/api';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';

/**
 * Guarda as rotas do painel: exige token válido E usuário administrador.
 * O backend já barra as operações (checkIsAdmin), mas sem isto a interface
 * administrativa fica acessível a qualquer usuário autenticado — ou mesmo
 * sem token, digitando a rota direto na URL.
 */
export const ProtectedRoute = () => {
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem('token'));
  const { user, isLoading, error } = useCurrentUser();

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Segura a renderização: sem isto a tela admin pisca antes do redirect.
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Token inválido/expirado ou conta sem permissão: derruba a sessão
  // (revogação no servidor em segundo plano; a navegação não espera).
  if (error || !user || user.userType !== 'admin') {
    void encerrarSessao();
    return <Navigate to="/login" replace state={{ deniedAdmin: !error && !!user }} />;
  }

  return <Outlet />;
};
