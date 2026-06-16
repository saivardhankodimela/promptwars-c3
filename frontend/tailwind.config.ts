import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080d0a", // Deep Eco Dark Forest Background
        foreground: "#f2f7f4",
        card: {
          DEFAULT: "rgba(18, 30, 24, 0.6)", // Glassmorphism translucent green-card
          foreground: "#f2f7f4",
          border: "rgba(34, 197, 94, 0.2)",
        },
        primary: {
          DEFAULT: "#10b981", // Emerald Green
          hover: "#059669",
          dark: "#064e3b",
          light: "#a7f3d0",
        },
        secondary: {
          DEFAULT: "#84cc16", // Lime Green
          hover: "#65a30d",
        },
        accent: {
          DEFAULT: "#f59e0b", // Amber/Gold for alerts/points
          hover: "#d97706",
        },
        eco: {
          gray: "#3f6250",
          leaf: "#22c55e",
          sky: "#38bdf8",
          polluted: "#6b7280",
          toxic: "#ef4444",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "forest-pattern": "linear-gradient(to bottom, rgba(8,13,10,0.9), rgba(8,13,10,0.95))",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
