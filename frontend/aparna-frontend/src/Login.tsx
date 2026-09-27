import React, { useState } from 'react';
import { Building } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch('https://127.0.0.1:7301/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data?.message || 'Login failed');
                return;
            }
            const data = await res.json();
            if (data?.token) {
                localStorage.setItem('af_token', data.token);
                window.location.reload();
            } else {
                setError('No token returned');
            }
        } catch (err) {
            setError('Login error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative">
            {/* Fixed Header at top */}
            <header className="fixed top-0 left-0 right-0 bg-slate-50 border-b border-slate-200 z-40">
                <div className="max-w-2xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow">
                            <Building className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-slate-900">APARNA FOODS</h1>
                                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase">Purchase Module AF</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Milling & Procurement ERP • Google Sheets Synchronizer</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main centered content with padding to avoid fixed header/footer */}
            <main className="pt-28 pb-28">
                <div className="max-w-md w-full mx-auto px-6">
                    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Sign in to your account</h2>
                        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Username</label>
                                <input
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    placeholder="admin"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    placeholder="password"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-500">Demo: <span className="font-medium">admin</span> / <span className="font-medium">password</span></div>
                                <button type="submit" className="px-4 py-2 bg-emerald-700 text-white rounded font-semibold hover:bg-emerald-800">Login</button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Fixed Footer at bottom */}
            <footer className="fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-200 py-4 z-40">
                <div className="max-w-2xl mx-auto text-center text-sm text-slate-500">© {new Date().getFullYear()} Aparna Foods — Purchase Module</div>
            </footer>
        </div>
    );
}
