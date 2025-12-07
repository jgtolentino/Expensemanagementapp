// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./FinancePPMApp.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Segoe UI", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      colors: {
        deakin: {
          primary:  "#0078d4",
          purple:   "#4b38b3",
          teal:     "#00b294",
          black:    "#000000",
          gold:     "#f2c811",
        },
        gray: {
          950: "#111111",
          900: "#1f1f1f",
          800: "#252526",
          700: "#333333",
          600: "#515151",
          500: "#737373",
          400: "#a3a3a3",
          300: "#d4d4d4",
          200: "#e5e5e5",
          100: "#f3f3f3",
          50:  "#fafafa",
        },
        semantic: {
          success:       "#107c10",
          successSoft:   "#e4f4e4",
          warning:       "#ffaa44",
          warningSoft:   "#fff4dd",
          danger:        "#a4262c",
          dangerSoft:    "#f9d6d9",
          info:          "#005a9e",
          infoSoft:      "#e5f1fb",
        },
        chart: {
          1: "#0078d4",
          2: "#4b38b3",
          3: "#00b294",
          4: "#f2c811",
          5: "#ff8c00",
        },
        heat: {
          low:  "#f2c6c6",
          mid:  "#c25757",
          high: "#580000",
        },
      },
      boxShadow: {
        "level-1": "0 1px 3px rgba(0, 0, 0, 0.08)",
        "level-2": "0 4px 8px rgba(0, 0, 0, 0.12)",
        "level-3": "0 8px 16px rgba(0, 0, 0, 0.14)",
        modal:     "0 16px 32px rgba(0, 0, 0, 0.24)",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
