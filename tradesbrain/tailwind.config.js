/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // TradesBrain Navy — design system primary brand colour.
        // Source: ../Design system asset/assets/brand-pack/README.md
        brand: {
          DEFAULT: '#1E3A5F',
          dark: '#13283F',
          light: '#3A5E86',
        },
      },
    },
  },
  plugins: [],
};
