import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#080b10",
        panel: "#101720",
        line: "#2a3545",
        gold: "#d6aa52",
        cyan: "#6dd8ff",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(109,216,255,0.16), 0 24px 80px rgba(0,0,0,0.42)",
      },
    },
  },
  plugins: [],
};

export default config;
