"use client";

import { usePathname } from "next/navigation";
import { Libre_Baskerville, Lora, Space_Mono } from "next/font/google";
import "./globals.css";
import DashboardShell from "@/components/layout/DashboardShell";
import { SidebarProvider } from "@/components/ui/sidebar";

// Configure Fonts
const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // The landing page (/) should be clean and full-screen.
  // Any other route (/entities, /evidence, etc.) gets the Dashboard Shell.
  const isLandingPage = pathname === "/";

  return (
    <html lang="en" className="dark">
      <body
        className={`${libreBaskerville.variable} ${lora.variable} ${mono.variable} font-mono antialiased bg-black text-white`}
      >
        <SidebarProvider defaultOpen={true}>
          {isLandingPage ? (
            // LANDING PAGE VIEW: No Sidebar, No Shell
            <main className="w-full min-h-screen">
              {children}
            </main>
          ) : (
            // APP VIEW: Sidebar + Header + Page Content
            <DashboardShell>
              {children}
            </DashboardShell>
          )}
        </SidebarProvider>
      </body>
    </html>
  );
}