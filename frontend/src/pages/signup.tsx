import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-100">
            <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-blue-200 flex flex-col items-center">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-blue-200 rounded-full p-4 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
                        </svg>
                    </div>
                </div>
                <form onSubmit={handleSignup} className="w-full space-y-4">
                    {error && (
                        <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm text-center">{error}</div>
                    )}
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5v-.75A4.5 4.5 0 008 6.75v.75m8.25 0A4.5 4.5 0 0012 2.25a4.5 4.5 0 00-4.5 4.5v.75m8.25 0v.75a4.5 4.5 0 01-4.5 4.5h-3a4.5 4.5 0 01-4.5-4.5v-.75" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 placeholder-blue-300"
                            placeholder="Name"
                            required
                        />
                    </div>
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
                            className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 placeholder-blue-300"
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
                            className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 placeholder-blue-300"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded transition-all duration-150"
                    >
                        {loading ? 'Signing up...' : 'SIGNUP'}
                    </button>
                </form>
                <div className="mt-6 text-center text-blue-400 text-xs">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">Login</Link>
                </div>
            </div>
        </div>
    );
}
