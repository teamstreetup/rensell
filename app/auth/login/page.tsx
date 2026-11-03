'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white border border-gray-100 shadow-premium p-6 sm:p-10 rounded-3xl animate-scale-in">
        
        {/* Logo and title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-md mx-auto hover:scale-105 transition-transform duration-300">
            <span className="text-white font-black text-lg">R</span>
          </div>
          <h2 className="text-2xl font-black text-dark tracking-tight">Sign in to RENSELL</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            New here?{' '}
            <Link href="/auth/signup" className="text-primary hover:text-primary-dark transition-colors underline">
              Create an account
            </Link>
          </p>
        </div>

        <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-times-circle text-sm" />
              <span>{error}</span>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input !pl-11 !text-xs !py-3"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input !pl-11 !text-xs !py-3"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary !py-3 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
