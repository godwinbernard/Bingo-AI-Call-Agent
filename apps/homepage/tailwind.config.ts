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
        bg: "#080C14",
        "bg-2": "#0D1420",
        "bg-3": "#111827",
        surface: "rgba(255,255,255,0.04)",
        "surface-hover": "rgba(255,255,255,0.07)",
        border: "rgba(255,255,255,0.07)",
        "border-bright": "rgba(255,255,255,0.14)",
        accent: "#4F8EF7",
        "accent-soft": "rgba(79,142,247,0.12)",
        "accent-glow": "rgba(79,142,247,0.25)",
        accent2: "#8B5CF6",
        "accent2-soft": "rgba(139,92,246,0.12)",
        success: "#10B981",
        warning: "#F59E0B",
        muted: "rgba(255,255,255,0.45)",
        subtle: "rgba(255,255,255,0.25)",
        text: "#E2E8F0",
        "text-dim": "rgba(226,232,240,0.6)",
      },
      fontFamily: {
        head: ["var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      animation: {
        pulseDot: "pulseDot 2.5s ease-in-out infinite",
        wave: "wave 1.4s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "gradient-shift": "gradientShift 6s ease infinite",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.4)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
