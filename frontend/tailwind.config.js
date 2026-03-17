/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: { 600: "#16a34a", 700: "#15803d", 800: "#166534" },
        earth: { 400: "#a3e635", 500: "#84cc16" },
      },
    },
  },
  plugins: [],
};
