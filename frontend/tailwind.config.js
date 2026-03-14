/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable CSS-class based dark mode
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#3B82F6',
        cta: '#F59E0B',
        background: '#F8FAFC',
        text: '#1E3A8A',
        // Dark mode variables
        'dark-bg': '#0F172A',
        'dark-card': 'rgba(30, 41, 59, 0.7)',
        'dark-text': '#F8FAFC',
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
        sans: ['Fira Sans', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 4px 30px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
