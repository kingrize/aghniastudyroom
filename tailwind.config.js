/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
        display: ["Quicksand", "sans-serif"],
      },
      colors: {
        cozy: {
          bg: "#FFF8F3", // Cream hangat
          card: "#FFFFFF",
          text: "#5D5D5D",
          primary: "#E68E8E", // Dusty Pink
          secondary: "#9FB8AD", // Sage Green
          accent: "#EAC286", // Soft Gold
        },
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(230, 142, 142, 0.15)",
      },
    },
  },
  plugins: [],
};
