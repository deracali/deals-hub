/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // if you use the app directory
    "./pages/**/*.{js,ts,jsx,tsx}", // if you have pages directory
    "./components/**/*.{js,ts,jsx,tsx}", // all components
  ],
  theme: {
    extend: {
      fontFamily: {
        helvetica: ['"Helvetica Neue"', "sans-serif"], // your heading font
        geist: "var(--font-geist-sans)", // Geist Sans
        geistMono: "var(--font-geist-mono)", // Geist Mono
      },
    },
  },
  plugins: [],
};
