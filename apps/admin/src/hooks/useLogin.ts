import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orpc } from '../services/api';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await orpc.identy.login({
        identifier: email,
        password,
      });

      if (response.token) {
        localStorage.setItem('token', response.token);
        navigate('/dashboard');
      } else {
        setError('Token não recebido. Tente novamente.');
      }
    } catch (err: unknown) {
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
