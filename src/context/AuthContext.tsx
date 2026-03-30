// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateAdmin } from '@/app/admin/actions';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => Promise<boolean>; // ✅ Removed password parameter
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = typeof window !== 'undefined' 
      ? sessionStorage.getItem('wtp_admin_session') 
      : null;

    queueMicrotask(() => {
      if (session === 'active') {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });
  }, []);

  // ✅ FIX: Removed password parameter since authenticateAdmin() doesn't accept one
  const login = async () => {
    try {
      // Securely verifying against the D1/Worker env via Server Action
      const res = await authenticateAdmin(); // ✅ No password argument
      if (res.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('wtp_admin_session', 'active');
        }
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error("Auth Error:", error);
    }
    return false;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('wtp_admin_session');
      setIsAuthenticated(false);
      window.location.href = '/admin/login';
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};