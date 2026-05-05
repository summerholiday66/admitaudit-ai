import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        line: "#d8dee9",
        mist: "#f7f8fa",
        accent: "#1f4b99"
      },
      boxShadow: {
        paper: "0 18px 50px rgba(15, 23, 42, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
