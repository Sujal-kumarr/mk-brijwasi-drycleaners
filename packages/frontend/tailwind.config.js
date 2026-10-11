/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4F72', // deep blue
          light: '#246b9a',
          dark: '#12344d',
        },
        accent: {
          DEFAULT: '#F39C12', // warm amber
          light: '#f5b041',
          dark: '#b9770e',
        },
        surface: '#F8F9FA',
      },
    },
  },
  plugins: [],
};
