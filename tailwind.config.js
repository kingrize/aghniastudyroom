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
          bg: "var(--c-bg)",
          card: "var(--c-card)",
          text: "var(--c-text)",
          muted: "var(--c-text-muted)",
          primary: "var(--c-primary)",
          secondary: "var(--c-secondary)",
          accent: "var(--c-accent)",
          border: "var(--c-border)",
          // 👇 TAMBAHAN BARU
          "user-bg": "var(--c-user-bg)",
          "user-text": "var(--c-user-text)",
        },
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
