import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

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
        // Additional custom color from first snippet
        peepsBlue: "#4A90E2",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Georgia", "serif"],
        heading: ["var(--font-heading)", "Georgia", "serif"],
        brand: ["var(--font-heading)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "Consolas", "monospace"],
        // Additional fonts from first snippet
        libre: ["var(--font-libre)", "serif"],
        lora: ["var(--font-lora)", "serif"],
      },
    },
  },
  plugins: [tailwindAnimate, typography],
};

export default config;