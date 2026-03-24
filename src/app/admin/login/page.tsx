"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Handle mounting to avoid hydration mismatch
  // We use requestAnimationFrame to satisfy the "no synchronous setState in effect" rule
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setHasMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Handle redirect in a separate effect
  useEffect(() => {
    if (hasMounted && isAuthenticated) {
      router.push('/admin/db');
    }
  }, [isAuthenticated, router, hasMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(password);
    if (success) {
      router.push('/admin/db');
    } else {
      setError(true);
      setPassword('');
    }
  };

  // 1. If not mounted yet, show the initialization screen
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-[#4A90E2] text-[10px] tracking-widest">
        INITIALIZING_SECURE_SESSION...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono p-4">
      <div className="w-full max-w-md border border-slate-800 p-8 bg-slate-900/20 backdrop-blur-sm">
        <div className="mb-8 text-center">
          <h1 className="text-white font-black tracking-[0.3em] text-xl">WTP_ACCESS_POINT</h1>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest">Authorized_Personnel_Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] text-slate-500 font-bold mb-2 block uppercase tracking-tighter">
              Enter_Pass-Key
            </label>
            <input 
              type="password"
              autoFocus
              className={`w-full bg-black border ${error ? 'border-red-600' : 'border-slate-700'} p-4 text-[#4A90E2] outline-none focus:border-[#4A90E2] transition-colors`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
            />
            {error && <p className="text-red-600 text-[9px] mt-2 uppercase">Invalid_Credentials_Denied</p>}
          </div>

          <button 
            type="submit"
            className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-black py-4 font-black text-xs tracking-[0.4em] transition-all"
          >
            INITIALIZE_SESSION
          </button>
        </form>
      </div>
    </div>
  );
}