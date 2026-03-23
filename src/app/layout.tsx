import type { Metadata } from "next";
import { Libre_Baskerville, Lora, Space_Mono } from "next/font/google";
import "./globals.css";

// 1. Initialize fonts and assign them to CSS variables
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

export const metadata: Metadata = {
  title: "We The Peeps | Accountability & Transparency",
  description: "A community platform for municipal transparency and public records.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 2. Apply the font variables to the body. 
        This clears the 'assigned a value but never used' warnings.
      */}
      <body
        className={`${libreBaskerville.variable} ${lora.variable} ${mono.variable} font-sans antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}