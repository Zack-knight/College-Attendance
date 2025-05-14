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
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideInRight': 'slideInRight 0.5s ease-in-out',
        'slideInLeft': 'slideInLeft 0.5s ease-in-out',
        'slideInUp': 'slideInUp 0.5s ease-in-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
};