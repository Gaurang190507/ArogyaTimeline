/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        health: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#9af5df',
          300: '#5ee7cb',
          400: '#2dd4b3',
          500: '#14b899',
          600: '#0d947b',
          700: '#0f7663',
          800: '#115e51',
          900: '#134e44',
          950: '#042f2a',
        },
        vital: {
          bp: '#ef4444',
          sugar: '#f59e0b',
          weight: '#3b82f6',
          temp: '#ec4899',
          meds: '#8b5cf6',
          symptom: '#f97316',
          doctor: '#06b6d4',
          doc: '#10b981',
          note: '#64748b',
          reminder: '#eab308'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 20px -5px rgba(20, 184, 153, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
