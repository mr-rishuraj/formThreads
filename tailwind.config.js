/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        accent: 'var(--accent)',
      },
      animation: {
        'fade-up': 'fadeUp 0.28s cubic-bezier(.16,1,.3,1) forwards',
        'fade-in': 'fadeIn 0.2s ease forwards',
        'pop-in': 'popIn 0.25s cubic-bezier(.16,1,.3,1) forwards',
        'slide-left': 'slideInLeft 0.22s cubic-bezier(.16,1,.3,1) forwards',
        'pulse-ring': 'pulseRing 2s infinite',
        'spin': 'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        popIn: {
          from: { opacity: '0', transform: 'scale(0.94) translateY(4px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseRing: {
          '0%':   { boxShadow: '0 0 0 0 rgba(124,106,255,0.4)' },
          '70%':  { boxShadow: '0 0 0 5px transparent' },
          '100%': { boxShadow: '0 0 0 0 transparent' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
