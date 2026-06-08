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
        bg: "#050510",
        surface: "rgba(255,255,255,0.03)",
        "surface-hover": "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.08)",
        "border-bright": "rgba(255,255,255,0.15)",
        accent: "#00f5d4",
        "accent-dim": "rgba(0,245,212,0.15)",
        accent2: "#7b61ff",
        "accent2-dim": "rgba(123,97,255,0.15)",
        accent3: "#ff6b6b",
        "accent3-dim": "rgba(255,107,107,0.15)",
        muted: "rgba(255,255,255,0.5)",
        subtle: "rgba(255,255,255,0.3)",
      },
      fontFamily: {
        head: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      animation: {
        pulseDot: "pulseDot 2s ease-in-out infinite",
        wave: "wave 1.2s ease-in-out infinite",
        fadeInUp: "fadeInUp 0.6s ease forwards",
        slideUp: "slideUp 0.4s ease forwards",
        float: "float 6s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.5)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,245,212,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0,245,212,0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
