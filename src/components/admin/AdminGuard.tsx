"use client";

import React, { useState } from 'react';
import { authenticateAdmin } from '@/app/admin/actions';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [hasError, setHasError] = useState(false); // Renamed to clarify usage

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false); // Reset error on new attempt
    
    const result = await authenticateAdmin(passphrase);
    if (result.success) {
      setIsAuthenticated(true);
    } else {
      setHasError(true);
      // Removed the browser alert to use the inline error instead
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono p-4">
        <form 
          onSubmit={handleLogin} 
          className={`border ${hasError ? 'border-red-600' : 'border-[#4A90E2]/50'} p-8 rounded-lg bg-slate-900/20 max-w-sm w-full shadow-[0_0_30px_rgba(74,144,226,0.1)] transition-colors duration-300`}
        >
          <h2 className={`${hasError ? 'text-red-500' : 'text-[#4A90E2]'} mb-6 text-center tracking-widest uppercase text-xs font-bold`}>
            {hasError ? "ACCESS_DENIED" : "Registry_Lock"}
          </h2>
          
          <input 
            type="password" 
            placeholder="Admin Passphrase"
            className={`w-full bg-black border ${hasError ? 'border-red-900' : 'border-slate-700'} p-3 text-white mb-4 focus:border-[#4A90E2] outline-none transition-colors`}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />
          
          <button className={`${hasError ? 'bg-red-600' : 'bg-[#4A90E2]'} w-full text-black py-3 font-bold uppercase text-xs tracking-widest transition-colors`}>
            {hasError ? "RETRY_AUTH" : "Unlock_Database"}
          </button>

          {hasError && (
            <p className="text-red-500 text-[9px] mt-4 text-center uppercase tracking-tighter animate-pulse">
              Invalid credentials. unauthorized access attempt logged.
            </p>
          )}
        </form>
      </div>
    );
  }

  return <>{children}</>;
}