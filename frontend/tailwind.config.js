/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '280px',
        'sm': '360px',
        'md': '480px',
        'lg': '640px',
        'xl': '768px',
        '2xl': '1024px',
        '3xl': '1280px',
        '4xl': '1536px',
        '5xl': '2048px',
        '6xl': '3000px',
        'h-xs': { 'raw': '(min-height: 490px)' },
        'h-sm': { 'raw': '(min-height: 640px)' },
        'h-md': { 'raw': '(min-height: 768px)' },
        'h-lg': { 'raw': '(min-height: 900px)' },
        'h-xl': { 'raw': '(min-height: 1024px)' },
        'h-2xl': { 'raw': '(min-height: 1280px)' },
        'h-3xl': { 'raw': '(min-height: 1440px)' },
        'h-4xl': { 'raw': '(min-height: 1600px)' },
        'h-5xl': { 'raw': '(min-height: 1800px)' },
        'h-6xl': { 'raw': '(min-height: 2000px)' },
      },
      borderRadius: {
        'none': '0',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2.2rem',
        '2xl': '3rem',
        'full': '9999px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
      },
      backdropBlur: {
        'glass': '20px',
      },
      backdropSaturate: {
        'glass': '180%',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.2)',
      },
    },
  },
  plugins: [],
}
