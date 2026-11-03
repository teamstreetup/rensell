'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.toLowerCase().endsWith('@mitaoe.ac.in')) {
      setError('Only college emails ending with @mitaoe.ac.in are allowed');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
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
        
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-md mx-auto hover:scale-105 transition-transform duration-300">
            <span className="text-white font-black text-lg">R</span>
          </div>
          <h2 className="text-2xl font-black text-dark tracking-tight">Create your account</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary-dark transition-colors underline">
              Sign in
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

          {/* Name input */}
          <div className="space-y-1">
            <label htmlFor="name" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input !pl-11 !text-xs !py-3"
                placeholder="John Doe"
              />
            </div>
          </div>

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
                placeholder="you@mitaoe.ac.in"
              />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Must end with @mitaoe.ac.in for KYC verification</p>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input !pl-11 !text-xs !py-3"
                placeholder="••••••••"
              />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Must be at least 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary !py-3 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
