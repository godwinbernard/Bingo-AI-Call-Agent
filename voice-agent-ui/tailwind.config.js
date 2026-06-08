/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        bg: {
          primary: '#0F0F1A',
          card: '#1A1A2E',
          elevated: '#1E1E35',
        },
        border: {
          subtle: '#2A2A40',
          medium: '#3A3A55',
        },
        'text-primary': '#F1F1F5',
        'text-secondary': '#9898B3',
        'text-muted': '#5A5A7A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-top': 'slideInTop 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'waveform-1': 'waveform 1.2s ease-in-out infinite 0s',
        'waveform-2': 'waveform 1.2s ease-in-out infinite 0.15s',
        'waveform-3': 'waveform 1.2s ease-in-out infinite 0.3s',
        'waveform-4': 'waveform 1.2s ease-in-out infinite 0.45s',
        'waveform-5': 'waveform 1.2s ease-in-out infinite 0.6s',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        slideInTop: {
          from: { transform: 'translateY(-10px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        waveform: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '18px' },
        },
        skeleton: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: 'calc(400px + 100%) 0' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover': '0 4px 20px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.2)',
        'glow-indigo': '0 0 20px rgba(99,102,241,0.3)',
      },
    },
  },
  plugins: [],
}
