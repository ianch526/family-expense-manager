/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans TC"', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#0F6E56',
          light: '#E1F5EE',
          hover: '#085041',
        },
        income: '#1D9E75',
        expense: '#E24B4A',
        warning: '#EF9F27',
        info: '#378ADD',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}
