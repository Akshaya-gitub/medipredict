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
        hospital: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        risk: {
          very_low: '#10b981',    // Emerald Green = Likely to Attend
          low: '#3b82f6',         // Blue = Low Risk
          moderate: '#f59e0b',    // Amber/Yellow = Moderate Risk
          high: '#f97316',        // Orange = High Risk
          very_high: '#ef4444',   // Red = Very High Risk
          ai: '#8b5cf6',          // Purple = AI / Analytics
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
