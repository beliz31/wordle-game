/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        mono: ["'Space Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg: { primary: "#07080f", secondary: "#0d0f1a", card: "#111827", elevated: "#1a1f2e" },
        neon: { green: "#39d353", yellow: "#f5c842", gray: "#3d4451", red: "#ff4757", blue: "#4dabf7" },
        tile: { empty: "#1a1f2e", filled: "#252c3d", correct: "#39d353", present: "#f5c842", absent: "#3d4451" },
      },
      boxShadow: {
        "neon-green": "0 0 10px #39d353, 0 0 20px #39d35355",
        "neon-yellow": "0 0 10px #f5c842, 0 0 20px #f5c84255",
        "neon-red": "0 0 10px #ff4757, 0 0 20px #ff475755",
        "neon-blue": "0 0 10px #4dabf7, 0 0 20px #4dabf755",
      },
    },
  },
  plugins: [],
};
