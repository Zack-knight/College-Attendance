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
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
        'gradient-teal': 'linear-gradient(to right, #0d9488, #14b8a6, #5eead4)',
        'gradient-cyan': 'linear-gradient(to right, #0891b2, #06b6d4, #22d3ee)',
        'gradient-azure': 'linear-gradient(to right, #0ea5e9, #38bdf8, #7dd3fc)',
        'gradient-indigo': 'linear-gradient(to right, #4f46e5, #6366f1, #a5b4fc)',
        'gradient-purple': 'linear-gradient(to right, #7e22ce, #a855f7, #d8b4fe)',
        'gradient-pink': 'linear-gradient(to right, #be185d, #ec4899, #fbcfe8)',
        'gradient-rose': 'linear-gradient(to right, #e11d48, #f43f5e, #fda4af)',
        'gradient-warm': 'linear-gradient(to right, #f59e0b, #fbbf24, #fde68a)',
      },
      boxShadow: {
        'neo-brutal': '8px 8px 0px rgba(0, 0, 0, 0.9)',
        'neo-pop': '6px 6px 0px #0d9488, 12px 12px 0px #14b8a6',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'inner-glow': 'inset 0 0 5px 2px rgba(94, 234, 212, 0.2)',
        'soft-3d': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        'harsh-3d': '5px 5px 0px #000, 10px 10px 0px #0d9488',
        'raised': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        'inset-3d': 'inset 1px 1px 0 rgba(255, 255, 255, 0.2), inset -1px -1px 0 rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideInRight': 'slideInRight 0.5s ease-in-out',
        'slideInLeft': 'slideInLeft 0.5s ease-in-out',
        'slideInUp': 'slideInUp 0.5s ease-in-out',
        'slideInDown': 'slideInDown 0.5s ease-in-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 5s ease-in-out infinite',
        'rotate': 'rotate 5s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite alternate',
        'morph': 'morph 8s ease-in-out infinite',
        'tilt': 'tilt 5s infinite linear',
        'shimmer': 'shimmer 2s infinite linear',
        'ripple': 'ripple 3s infinite ease-in-out',
        'scale': 'scale 2s infinite alternate',
        'wobble': 'wobble 2.5s ease-in-out infinite',
        'grow-shrink': 'grow-shrink 4s infinite alternate',
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
        slideInDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '50%': { borderRadius: '40% 60% 70% 30% / 60% 70% 40% 30%' },
          '75%': { borderRadius: '40% 30% 30% 70% / 30% 30% 70% 60%' },
        },
        tilt: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ripple: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(14, 165, 233, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 15px rgba(14, 165, 233, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(14, 165, 233, 0)' },
        },
        scale: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        wobble: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px) rotate(-5deg)' },
          '75%': { transform: 'translateX(10px) rotate(5deg)' },
        },
        'grow-shrink': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'width': 'width',
        'transform': 'transform',
      },
      borderRadius: {
        'morphing': '60% 40% 30% 70% / 60% 30% 70% 40%',
        'blob': '40% 60% 70% 30% / 60% 70% 40% 30%',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};