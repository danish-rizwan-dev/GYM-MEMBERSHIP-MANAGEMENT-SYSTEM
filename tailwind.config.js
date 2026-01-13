/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- THIS IS REQUIRED FOR THE BUTTON TO WORK
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}