import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, User as UserIcon, Siren, Loader2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  onLogin: (user: User) => void;
}

export default function AuthModal({ onLogin }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const userData: User = await response.json();
      onLogin(userData);
    } catch (err) {
      setError('Could not connect to authentication services.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (demoRole: UserRole, demoEmail: string, demoName: string) => {
    setEmail(demoEmail);
    setName(demoName);
    setRole(demoRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black pointer-events-none opacity-80" />
      
      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-red-950/40 border border-red-900/40 rounded-full text-red-500 mb-4 animate-pulse">
            <Siren className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            AI Disaster Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            EOC Preparedness, Response, and Relief Operations Center
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/30 rounded-xl flex gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Select Operating Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['citizen', 'responder', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-3 px-2 rounded-xl border text-center transition-all capitalize flex flex-col items-center justify-center gap-1.5 ${
                    role === r
                      ? 'bg-red-950/40 border-red-500 text-red-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {r === 'admin' && <Shield className="w-4 h-4" />}
                  {r === 'responder' && <Siren className="w-4 h-4" />}
                  {r === 'citizen' && <UserIcon className="w-4 h-4" />}
                  <span className="text-xs font-medium">{r}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-slate-100 font-semibold rounded-xl py-3.5 px-4 shadow-lg hover:shadow-red-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Enter Incident Command Center'
            )}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-slate-900/90 px-3 text-xs text-slate-500 uppercase tracking-widest font-semibold">
            Or Use Demo Account
          </span>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => selectDemoAccount('admin', 'hema2007l22@gmail.com', 'Hema Admin')}
            className="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 flex items-center justify-between group transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-slate-200 text-xs font-semibold">Hema Admin (Administrator)</div>
                <div className="text-slate-500 text-[11px]">hema2007l22@gmail.com</div>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">ADMIN</span>
          </button>

          <button
            type="button"
            onClick={() => selectDemoAccount('responder', 'responder@disasterintel.org', 'Officer Dave')}
            className="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 flex items-center justify-between group transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Siren className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-slate-200 text-xs font-semibold">Officer Dave (First Responder)</div>
                <div className="text-slate-500 text-[11px]">responder@disasterintel.org</div>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">RESPONDER</span>
          </button>

          <button
            type="button"
            onClick={() => selectDemoAccount('citizen', 'citizen@disasterintel.org', 'Citizen Maria')}
            className="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-3 flex items-center justify-between group transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-slate-200 text-xs font-semibold">Citizen Maria (Affected Resident)</div>
                <div className="text-slate-500 text-[11px]">citizen@disasterintel.org</div>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">CITIZEN</span>
          </button>
        </div>
      </div>
    </div>
  );
}
