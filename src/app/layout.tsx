import { Libre_Baskerville, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "We The Peeps | Public Interest Archive",
  description:
    "Accountability journalism and legal evidence archive. Documenting government misconduct in the public interest.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${libreBaskerville.variable} ${lora.variable} ${mono.variable}`}
    >
      <body className="bg-[#0B0E14] text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
