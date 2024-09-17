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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        error: "rgb(var(--error) / <alpha-value>)",
        onBackground: "rgb(var(--on-background) / <alpha-value>)",
        onSurface: "rgb(var(--on-surface) / <alpha-value>)",
        onPrimary: "rgb(var(--on-primary) / <alpha-value>)",
        onSecondary: "rgb(var(--on-secondary) / <alpha-value>)",
        onError: "rgb(var(--on-error) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
