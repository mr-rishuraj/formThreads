/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['VT323', 'Courier New', 'monospace'],
        mono: ['Press Start 2P', 'monospace'],
        pixel: ['Press Start 2P', 'monospace'],
      },
      colors: {
        accent: 'var(--accent)',
      },
      animation: {
        'fade-up':    'fadeUp 0.2s steps(6, end) forwards',
        'fade-in':    'fadeIn 0.15s steps(4, end) forwards',
        'pop-in':     'popIn 0.22s steps(8, end) forwards',
        'slide-left': 'slideInLeft 0.18s steps(5, end) forwards',
        'pulse-ring': 'pulseRing 2s infinite',
        'spin':       'spin 0.7s steps(8, end) infinite',
        'pixel-blink':'pixelBlink 1s steps(1, end) infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        popIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92) translateY(6px)' },
          '60%':  { opacity: '1', transform: 'scale(1.02) translateY(0)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-6px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseRing: {
          '0%':   { boxShadow: '0 0 0 0 rgba(136,119,255,0.4)' },
          '70%':  { boxShadow: '0 0 0 6px transparent' },
          '100%': { boxShadow: '0 0 0 0 transparent' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pixelBlink: {
          '0%, 49%':   { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
