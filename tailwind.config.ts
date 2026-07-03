import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B3A5C",
          light: "#234b75",
          dark: "#122840",
        },
        teal: {
          DEFAULT: "#2E7D8C",
          light: "#3a9aad",
          dark: "#236070",
        },
        gold: {
          DEFAULT: "#C8982A",
          light: "#d4a93e",
          dark: "#a67d20",
          // For text on light backgrounds — 5.05:1 on white (AA pass);
          // the DEFAULT gold is decorative-only at 2.6:1.
          text: "#8A6A1D",
        },
        sage: {
          DEFAULT: "#4A7C59",
          light: "#5a9470",
          dark: "#3a6045",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8F8F6",
          border: "#E8E8E4",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#666666",
          faint: "#999999",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-in": "slideIn 0.3s ease forwards",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        card: "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        elevated:
          "0 8px 32px rgba(27,58,92,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        glow: "0 0 0 3px rgba(46,125,140,0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
