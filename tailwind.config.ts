import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Eastman Alternate', 'Outfit', 'Inter', 'Aptos', 'Segoe UI', 'Arial', 'sans-serif'],
        display: ['Eastman Alternate', 'Outfit', 'Inter', 'Aptos Display', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
