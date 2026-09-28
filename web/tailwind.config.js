/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glitzup: {
          navy: '#012341',
          slate: '#2C3E50',
          red: '#E74C3C',
          gold: '#F1C40F',
          darkBlue: '#0a192f',
          lightBg: '#f8fafc',
          border: '#e2e8f0',
          accentGreen: '#10B981'
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
