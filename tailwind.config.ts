import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#1A1512",
        "obsidian-2": "#20191410",
        clay: "#C8623D",
        "clay-bright": "#D6754F",
        sage: "#8A9A85",
        sand: "#F2E7DB",
        mocha: "#B7A08C",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "orb-drift": {
          "0%": { transform: "translate(0,0) scale(1)" },
          "100%": { transform: "translate(120px,90px) scale(1.15)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(200,98,61,0.45)" },
          "70%": { boxShadow: "0 0 0 18px rgba(200,98,61,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(200,98,61,0)" },
        },
        float: {
          "0%": { transform: "translateY(0px)" },
          "100%": { transform: "translateY(-16px)" },
        },
      },
      animation: {
        "orb-drift": "orb-drift 26s infinite alternate ease-in-out",
        "pulse-ring": "pulse-ring 4s infinite",
        float: "float 6s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
