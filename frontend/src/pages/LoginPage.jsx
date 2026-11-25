import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { extractApiError } from '../services/api';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleLogin = async (credentials) => {
    setError('');
    setLoading(true);
    try {
      const data = await login(credentials);
      showToast(`Welcome back, ${data.user?.name || 'User'}!`, 'success');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(extractApiError(err, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xl py-5 my-3">
      <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
    </div>
  );
}
