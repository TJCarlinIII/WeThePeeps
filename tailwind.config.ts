import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        accent: {
          DEFAULT: "#4A90E2",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        // Lora — elegant serif for body text and descriptions
        sans: ["var(--font-sans)", "Georgia", "serif"],
        // Libre Baskerville — authoritative serif for headings and titles
        heading: ["var(--font-heading)", "Georgia", "serif"],
        // Keep "brand" mapped to heading for backward compat
        brand: ["var(--font-heading)", "Georgia", "serif"],
        // JetBrains Mono — technical labels, dates, codes
        mono: ["var(--font-mono)", "Consolas", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;