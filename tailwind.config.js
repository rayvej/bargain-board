import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './docs/index.html',
    './docs/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        // Bargain Board brand palette
        bb: {
          primary:   '#06B6D4',  // Teal/Cyan
          'primary-dark': '#0891B2',
          accent:    '#F97316',  // Orange/Coral
          'accent-dark': '#EA580C',
          success:   '#22C55E',  // Green — savings, verified
          warning:   '#EAB308',  // Yellow — unverified
          danger:    '#EF4444',  // Red — expired
          bg:        '#F8FAFC',  // Light gray-blue background
          surface:   '#FFFFFF',  // Card surfaces
          text:      '#0F172A',  // Slate 900
          'text-secondary': '#64748B', // Slate 500
          'text-muted': '#94A3B8',     // Slate 400
          border:    '#E2E8F0',  // Slate 200
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.06)',
        'search': '0 4px 16px rgba(6, 182, 212, 0.15)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s infinite',
        'copy-flash': 'copyFlash 0.6s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        copyFlash: {
          '0%': { backgroundColor: 'rgb(34 197 94 / 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
    },
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: false,
    logs: false,
  },
};
