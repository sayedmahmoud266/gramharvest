/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        instagram: {
          primary: '#E4405F',
          secondary: '#833AB4',
          accent: '#F56040'
        }
      }
    },
  },
  plugins: [],
}
