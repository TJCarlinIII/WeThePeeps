"use client";

import React, { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Replace 'login' with whatever your AuthContext method is named
    const success = await login(password);

    if (success) {
      router.push("/admin");
    } else {
      setError("ACCESS_DENIED: INVALID_CREDENTIALS");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono p-4">
      <div className="w-full max-w-md border border-slate-900 bg-slate-950/50 p-8 shadow-2xl">
        <header className="mb-8">
          <h1 className="text-[#4A90E2] text-xl font-bold tracking-tighter uppercase">
            System_Auth_Gate
          </h1>
          <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-widest">
            Enter Administrative Passkey
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSKEY_INPUT..."
              className="w-full bg-black border border-slate-800 p-3 text-slate-300 focus:border-[#4A90E2] outline-none transition-colors placeholder:text-slate-700"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-600 text-[10px] font-bold animate-pulse uppercase">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#4A90E2] text-black font-black py-3 uppercase text-xs tracking-tighter hover:bg-[#357ABD] transition-colors"
          >
            Execute_Sign_In
          </button>
        </form>

        <footer className="mt-8 pt-6 border-t border-slate-900">
          <p className="text-slate-700 text-[9px] leading-relaxed uppercase">
            Notice: Unauthorized access to this registry is logged. 
            IP_ADDR: CLIENT_SOURCE_REQUESTED
          </p>
        </footer>
      </div>
    </div>
  );
}