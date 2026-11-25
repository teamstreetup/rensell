import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { extractApiError } from '../services/api';
import SignupForm from '../components/SignupForm';

export default function SignupPage() {
  const { signup, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = async (payload) => {
    setError('');
    setLoading(true);
    try {
      const data = await signup(payload);
      showToast(`Welcome to RENSELL, ${data.user?.name}!`, 'success');
      navigate('/', { replace: true });
    } catch (err) {
      setError(extractApiError(err, 'Signup failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xl py-5 my-3">
      <SignupForm onSubmit={handleSignup} loading={loading} error={error} />
    </div>
  );
}
