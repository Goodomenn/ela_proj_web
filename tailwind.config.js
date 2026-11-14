/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: '#0D121D',
          card: '#161C28',
          border: '#1E2635',
          accent: '#00D1FF',
          textPrimary: '#FFFFFF',
          textSecondary: '#8E99AE',
          success: '#00FF94',
          warning: '#FFB800',
          error: '#FF4D4D',
          info: '#339AF0',
          outer: '#070A10',
        },
        cenet: {
          light: '#ede7f6',
          DEFAULT: '#673ab7',
          dark: '#512da8'
        },
        loop: {
          light: '#e0f2f1',
          DEFAULT: '#009688',
          dark: '#00796b'
        },
        audit: {
          light: '#e8eaf6',
          DEFAULT: '#3f51b5',
          dark: '#303f9f'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
