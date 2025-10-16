/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.liquid",
    "./src/**/*.{js,css}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#000000',
        'brand-orange': '#FFA500',
        'brand-purple': '#800080',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
