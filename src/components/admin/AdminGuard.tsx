"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Ensure mounting is complete to avoid hydration mismatches
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Handle unauthorized access redirects
  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      // Redirecting to stylized admin login route
      router.push("/admin/login"); 
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  // Loading state visual for secure session initialization
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-slate-500">
        <span className="animate-pulse tracking-widest uppercase text-[10px]">
          Secure_Session_Init...
        </span>
      </div>
    );
  }

  // Final validation: Render children only if authenticated
  return isAuthenticated ? <>{children}</> : null;
}