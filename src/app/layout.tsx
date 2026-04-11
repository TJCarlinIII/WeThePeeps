"use client";

import { usePathname } from "next/navigation";
import { Libre_Baskerville, Lora, Space_Mono } from "next/font/google";
import "./globals.css";

import Footer from "@/components/blocks/Footer";
import { AuthProvider } from "@/context/AuthContext";
import GlobalHeader from "@/components/layout/GlobalHeader";
import MouseGlow from "@/components/MouseGlow";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isAuthPage = pathname === "/admin/login" || pathname === "/login";

  return (
    <html
      lang="en"
      className={`dark ${libreBaskerville.variable} ${lora.variable} ${mono.variable}`}
    >
      <body className="min-h-screen flex flex-col font-mono antialiased bg-[#050A18] investigative-grid">
        <MouseGlow />
        <div className="grid-glow" aria-hidden="true" />

        <AuthProvider>
          {isAuthPage ? (
            <>{children}</>
          ) : (
            <div className="flex flex-col min-h-screen">
              {!isHome && <GlobalHeader />}
              <div className="flex-1 relative z-10">
                {children}
              </div>
              <Footer />
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}