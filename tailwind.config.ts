import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, food-friendly palette
        grain: {
          50: "#faf7f0",
          100: "#f3ecdd",
          200: "#e6d7ba",
          300: "#d6bd8d",
          400: "#c69f5e",
          500: "#b8893f",
          600: "#a07034",
          700: "#80552c",
          800: "#6a4528",
          900: "#583a25",
        },
        leaf: {
          50: "#f1f8f3",
          100: "#dcefe1",
          200: "#bbdec6",
          300: "#8cc69f",
          400: "#57a673",
          500: "#368856",
          600: "#266c44",
          700: "#1f5638",
          800: "#1b452e",
          900: "#173a28",
        },
        // Warm terracotta / clay — hand-thrown pottery feel
        clay: {
          50: "#fbf3ee",
          100: "#f6e3d8",
          200: "#ecc6b0",
          300: "#e0a484",
          400: "#d2825b",
          500: "#c06a42",
          600: "#a55435",
          700: "#85422c",
          800: "#6b3726",
          900: "#5a3022",
        },
        // Soft sage / herb green for accents
        sage: {
          50: "#f4f6f0",
          100: "#e6ebdc",
          200: "#cdd7bb",
          300: "#aebd92",
          400: "#90a06f",
          500: "#738455",
          600: "#5a6943",
          700: "#465237",
          800: "#3a4330",
          900: "#323a2b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        // Slightly irregular, organic corners
        blob: "1.6rem 1.4rem 1.7rem 1.3rem",
      },
      boxShadow: {
        soft: "0 2px 14px -6px rgba(120, 85, 50, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
