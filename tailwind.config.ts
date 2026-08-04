import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        background: "#0B0F17",
        surface: "#111827",
        "surface-hover": "#1F2937",
        primary: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
        },
        secondary: "#10B981",
        error: "#EF4444",
        onBackground: "#F8FAFC",
        onSurface: "#FFFFFF",
        muted: "#94A3B8",
        border: "#1F2937",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
