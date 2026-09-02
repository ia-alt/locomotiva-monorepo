import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { orpc, salvarSessao, encerrarSessao } from '../services/api';
import { CURRENT_USER_QUERY_KEY } from './useCurrentUser';

const NOT_ADMIN_MESSAGE = 'Esta conta não tem acesso ao painel administrativo.';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Sessão derrubada pelo ProtectedRoute por falta de permissão.
  useEffect(() => {
    if ((location.state as { deniedAdmin?: boolean } | null)?.deniedAdmin) {
      setError(NOT_ADMIN_MESSAGE);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await orpc.identy.login({
        identifier: email,
        password,
      });

      if (!response.token) {
        setError('Token não recebido. Tente novamente.');
        return;
      }

      salvarSessao(response.token, response.refreshToken);

      // O login é compartilhado com mobile/tablet e não distingue perfil —
      // só o painel exige administrador.
      const user = await orpc.identy.getMe({});
      if (user.userType !== 'admin') {
        // A sessão chegou a ser aberta no servidor; revoga em vez de só esquecer.
        await encerrarSessao();
        setError(NOT_ADMIN_MESSAGE);
        return;
      }

      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
      navigate('/dashboard');
    } catch (err: unknown) {
      await encerrarSessao();
      console.error('Login error:', err);
      let message = 'Falha ao realizar login. Verifique suas credenciais.';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleLogin,
  };
};
