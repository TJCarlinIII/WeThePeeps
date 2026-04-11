"use client";

interface DashboardShellProps {
  children: React.ReactNode;
  hideSidebars?: boolean;
}

// Retained for backward-compatibility with any admin pages that import it.
// Sidebar and LIVE_TELEMETRY have been removed — this is now a clean pass-through.
export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-transparent w-full">
      <main className="flex-1 flex flex-col bg-transparent w-full">
        {children}
      </main>
    </div>
  );
}