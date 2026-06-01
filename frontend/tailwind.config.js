/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0B10',
          50: '#f4f4f6',
          100: '#e8e9ed',
          200: '#c9ccd4',
          300: '#9ca3b0',
          400: '#6b7284',
          500: '#4b5263',
          600: '#363c4d',
          700: '#252a38',
          800: '#161a24',
          900: '#0A0B10',
          950: '#050508',
        },
        sand: {
          DEFAULT: '#F7F5F0',
          50: '#FDFCFA',
          100: '#F7F5F0',
          200: '#EDE9E0',
        },
        accent: {
          DEFAULT: '#E8A317',
          light: '#F5C84A',
          dark: '#C4860E',
          muted: '#FEF6E4',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal': 'reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        reveal: {
          '0%': { transform: 'translateY(32px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        glow: '0 0 80px -20px rgba(232, 163, 23, 0.35)',
        'glow-sm': '0 0 40px -10px rgba(232, 163, 23, 0.25)',
        card: '0 4px 24px -4px rgba(10, 11, 16, 0.08), 0 1px 3px rgba(10, 11, 16, 0.04)',
        'card-hover': '0 20px 50px -15px rgba(10, 11, 16, 0.15)',
      },
    },
  },
  plugins: [],
}
