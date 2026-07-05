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
          DEFAULT: "#4338CA",
          light: "#4F46E5",
          dark: "#3730A3",
        },
        teal: {
          DEFAULT: "#0E7490",
          light: "#0891B2",
          dark: "#155E75",
        },
        gold: {
          DEFAULT: "#F59E0B",
          light: "#FBbf24",
          dark: "#D97706",
          // For text on light backgrounds — 5.0:1 on white (AA pass);
          // the DEFAULT gold is a fill colour, pair it with dark text.
          text: "#92610C",
        },
        sage: {
          DEFAULT: "#15803D",
          light: "#16A34A",
          dark: "#166534",
        },
        coral: {
          DEFAULT: "#E11D48",
          light: "#F43F5E",
          dark: "#BE123C",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#FAF5EC",
          border: "#EBE2D2",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#63605A",
          faint: "#999999",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["ui-monospace", "monospace"],
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
