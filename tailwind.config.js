/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        transit: {
          navy: '#0B2B45',
          navyLight: '#123A5C',
          teal: '#1E9C89',
          tealLight: '#2CBBA4',
          amber: '#F2A93B',
          amberDark: '#D98E1F',
          fog: '#F7F9FB',
          slate: '#5B6B7A',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 30px -12px rgba(11, 43, 69, 0.25)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.6)', opacity: '0.4' },
        },
        driveIn: {
          '0%': { transform: 'translateX(-12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
        driveIn: 'driveIn 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
