/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10B981', // Emerald Green
        secondary: '#0D9488', // Teal
        accent: '#F59E0B', // Amber
        background: '#111827', // Dark gray
        card: '#1F2937', // Slightly lighter gray for cards
        text: '#F3F4F6', // Light text
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to right, #111827, #0D1B2A)', // Dark gradient
      },
    },
  },
  plugins: [],
};