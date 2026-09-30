import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Every colour reads a CSS token (globals.css), so dark mode is a
      // change of token values rather than a second set of classes.
      colors: {
        navy: {
          DEFAULT: "rgb(var(--c-navy) / <alpha-value>)",
          light: "rgb(var(--c-navy-light) / <alpha-value>)",
          dark: "rgb(var(--c-navy-dark) / <alpha-value>)",
        },
        teal: {
          DEFAULT: "rgb(var(--c-teal) / <alpha-value>)",
          light: "rgb(var(--c-teal-light) / <alpha-value>)",
          dark: "rgb(var(--c-teal-dark) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--c-gold) / <alpha-value>)",
          light: "rgb(var(--c-gold-light) / <alpha-value>)",
          dark: "rgb(var(--c-gold-dark) / <alpha-value>)",
          // For text on light backgrounds — 5.0:1 on white (AA pass);
          // the DEFAULT gold is a fill colour, pair it with dark text.
          text: "rgb(var(--c-gold-text) / <alpha-value>)",
        },
        sage: {
          DEFAULT: "rgb(var(--c-sage) / <alpha-value>)",
          light: "rgb(var(--c-sage-light) / <alpha-value>)",
          dark: "rgb(var(--c-sage-dark) / <alpha-value>)",
        },
        coral: {
          DEFAULT: "rgb(var(--c-coral) / <alpha-value>)",
          light: "rgb(var(--c-coral-light) / <alpha-value>)",
          dark: "rgb(var(--c-coral-dark) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--c-surface) / <alpha-value>)",
          muted: "rgb(var(--c-surface-muted) / <alpha-value>)",
          border: "rgb(var(--c-border) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          muted: "rgb(var(--c-ink-muted) / <alpha-value>)",
          faint: "rgb(var(--c-ink-faint) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        story: ["var(--font-fraunces)", "Georgia", "serif"],
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
