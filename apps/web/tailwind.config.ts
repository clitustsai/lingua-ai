import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Deep purple dark theme like the screenshot
        app: {
          bg: "#0f0a1e",        // very dark purple-black
          card: "#1a1035",      // dark purple card
          cardHover: "#221445",
          border: "#2d1f5e",
          surface: "#160d2e",
        },
        primary: {
          50: "#f5f0ff",
          100: "#ede5ff",
          300: "#c4a8ff",
          400: "#a87fff",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          900: "#2e1065",
        },
        accent: {
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        gem: {
          400: "#818cf8",
          500: "#6366f1",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "purple-gradient": "linear-gradient(135deg, #1a0533 0%, #0f0a1e 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(139,92,246,0.15) 0%, rgba(15,10,30,0) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
