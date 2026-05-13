import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oly: {
          blue: "#0085C7",
          yellow: "#F4C300",
          black: "#0A1F2E",
          green: "#009F3D",
          red: "#DF0024",
        },
        ink: {
          DEFAULT: "#0A1F2E",
          soft: "#475569",
          mute: "#94A3B8",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F0F3FA",
        },
        bg: "#F6F8FC",
        border: "#E2E8F0",
        gold: "#FFD700",
        silver: "#C8CCD3",
        bronze: "#CD7F32",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10,31,46,.06)",
        card: "0 4px 16px rgba(10,31,46,.08)",
        pop: "0 16px 40px rgba(10,31,46,.16)",
      },
      backgroundImage: {
        "grad-hero":
          "linear-gradient(135deg,#0A1F2E 0%,#0085C7 60%,#F4C300 130%)",
        "grad-card":
          "linear-gradient(135deg,#0085C7 0%,#0A1F2E 100%)",
      },
      borderRadius: {
        xl2: "18px",
      },
      keyframes: {
        toastIn: {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        toastIn: "toastIn .25s cubic-bezier(.16,1,.3,1)",
        fadeIn: "fadeIn .2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
