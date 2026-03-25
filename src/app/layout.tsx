"use client";

import { usePathname } from "next/navigation";
import { Libre_Baskerville, Lora, Space_Mono } from "next/font/google";
import "./globals.css";
import DashboardShell from "@/components/layout/DashboardShell";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/AuthContext"; // Ensure this path is correct

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
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white font-mono antialiased">
        <AuthProvider> 
          {/* All children MUST be inside the Provider to avoid the useAuth error */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}