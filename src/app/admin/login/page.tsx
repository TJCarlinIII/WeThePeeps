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

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setHasMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // REDIRECT FIX #1: If already logged in, go to Taxonomy
  useEffect(() => {
    if (hasMounted && isAuthenticated) {
      router.push('/admin/taxonomy');
    }
  }, [isAuthenticated, router, hasMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(password);
    if (success) {
      // REDIRECT FIX #2: On successful login, go to Taxonomy
      router.push('/admin/taxonomy');
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-[#4A90E2] text-xl tracking-[0.5em] animate-pulse">
        INITIALIZING_SECURE_SESSION...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono p-4">
      <div className="w-full max-w-xl border-2 border-slate-800 p-12 bg-slate-900/20 backdrop-blur-sm rounded-lg shadow-2xl">
        <div className="mb-12 text-center">
          <h1 className="text-white font-black tracking-[0.4em] text-3xl">WTP_ACCESS_POINT</h1>
          <p className="text-slate-500 text-xs mt-4 uppercase tracking-[0.3em] font-bold">Authorized_Personnel_Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <label className="text-xs text-slate-400 font-black mb-4 block uppercase tracking-widest">
              Enter_Pass-Key
            </label>
            <input 
              type="password"
              autoFocus
              className={`w-full bg-black border-2 ${error ? 'border-red-600' : 'border-slate-700'} p-6 text-2xl text-[#4A90E2] outline-none focus:border-[#4A90E2] transition-all rounded-md`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
            />
            {error && <p className="text-red-600 text-sm mt-4 font-black uppercase tracking-widest animate-bounce">Access_Denied_Invalid_Key</p>}
          </div>

          <button 
            type="submit"
            className="w-full bg-[#4A90E2] hover:bg-white text-black py-6 font-black text-xl tracking-[0.3em] transition-all rounded-md shadow-[0_0_20px_rgba(74,144,226,0.3)]"
          >
            INITIALIZE_SESSION
          </button>
        </form>
        
        <div className="mt-12 text-center border-t border-slate-900 pt-8">
            <span className="text-[10px] text-slate-700 font-bold tracking-widest uppercase italic">Encryption_Standard: AES-256_Edge_Secure</span>
        </div>
      </div>
    </div>
  );
}