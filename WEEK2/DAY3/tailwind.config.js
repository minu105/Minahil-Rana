/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./script.js", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          'custom-orange': '#FC8A06', // Your specific orange color
        },
      },
    },
  },
  plugins: [],
}
