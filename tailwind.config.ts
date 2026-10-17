import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        slate: {
          750: "#243044",
          850: "#131c2e",
        },
        obsidian: {
          DEFAULT: "#0D0D0E",
          canvas: "#0D0D0E",
          surface: "#17171A",
          card: "#17171A",
          popover: "#1C1C20",
          border: "rgba(255, 255, 255, 0.07)",
        },
        warmAmber: {
          DEFAULT: "#E08738",
          primary: "#E08738",
          hover: "#D97706",
          gradient: "#F59E0B",
          glow: "rgba(224, 135, 56, 0.35)",
          subdued: "rgba(245, 158, 11, 0.12)",
        },
        pulse: {
          DEFAULT: "#8B6BD6",
          primary: "#8B6BD6",
          deep: "#6F52B5",
          dark: "#59409A",
          soft: "#A78BDF",
          light: "#F4F0FC",
          border: "#DDD3F4",
          hover: "#795BC2",
          surface: "#F8F7FB",
          card: "#FFFFFF",
          secondary: "#F4F1FA",
          hoverSurface: "#F0EBF9",
          text: "#17132B",
          textSecondary: "#68627A",
          textMuted: "#9690A5",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
