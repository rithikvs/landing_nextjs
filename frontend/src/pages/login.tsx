import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState((router.query.email as string) || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      // router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 animate-gradient-x">
      <div className="w-full max-w-sm p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-200 flex flex-col items-center transition-transform duration-300 hover:scale-105">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-tr from-blue-300 to-blue-500 rounded-full p-4 mb-2 shadow-md animate-bounce-slow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
            </svg>
          </div>
        </div>
        <form onSubmit={handleLogin} className="w-full space-y-4">
          {router.query.email && (
            <div className="mb-2 p-2 bg-green-100 border border-green-300 rounded text-green-700 text-sm text-center animate-pulse">
              Registered successfully! Please login with <b>{router.query.email}</b>.
            </div>
          )}
          {error && (
            <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm text-center animate-pulse">{error}</div>
          )}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5v-.75A4.5 4.5 0 008 6.75v.75m8.25 0A4.5 4.5 0 0012 2.25a4.5 4.5 0 00-4.5 4.5v.75m8.25 0v.75a4.5 4.5 0 01-4.5 4.5h-3a4.5 4.5 0 01-4.5-4.5v-.75" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 placeholder-blue-300 shadow-sm transition-all duration-200 focus:scale-[1.03]"
              placeholder="Email"
              required
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.125A2.625 2.625 0 0013.875 4.5h-3.75A2.625 2.625 0 007.5 7.125V10.5m9 0v7.125A2.625 2.625 0 0113.875 20.25h-3.75A2.625 2.625 0 017.5 17.625V10.5m9 0a2.625 2.625 0 00-2.625-2.625h-3.75A2.625 2.625 0 007.5 10.5m9 0H7.5" />
              </svg>
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 placeholder-blue-300 shadow-sm transition-all duration-200 focus:scale-[1.03]"
              placeholder="Password"
              required
            />
          </div>
          <div className="flex items-center justify-between text-xs text-blue-500 mb-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-1 accent-blue-400" /> Remember me
            </label>
            <a href="#" className="hover:underline">Forgot password?</a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg shadow-md transition-all duration-200 hover:scale-105"
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>
        <div className="mt-6 text-center text-blue-400 text-xs">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline font-medium">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
