"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Avoid synchronous state setting within the effect body
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) setMounted(true);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router, pathname, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center font-mono text-[#4A90E2]">
        INITIALIZING_SECURE_SESSION...
      </div>
    );
  }

  // Do not block the login page itself
  if (!isAuthenticated && pathname !== '/admin/login') return null;

  return <>{children}</>;
}