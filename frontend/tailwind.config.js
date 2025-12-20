/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Screen breakpoints
      screens: {
        'xs': '280px',
        'sm': '360px',
        'md': '480px',
        'lg': '640px',
        'xl': '768px',
        '2xl': '1024px',
        '3xl': '1280px',
        '4xl': '1536px',
        '5xl': '2048px',
        '6xl': '3000px',
        'h-xs': { 'raw': '(min-height: 490px)' },
        'h-sm': { 'raw': '(min-height: 640px)' },
        'h-md': { 'raw': '(min-height: 768px)' },
        'h-lg': { 'raw': '(min-height: 900px)' },
        'h-xl': { 'raw': '(min-height: 1024px)' },
        'h-2xl': { 'raw': '(min-height: 1280px)' },
        'h-3xl': { 'raw': '(min-height: 1440px)' },
        'h-4xl': { 'raw': '(min-height: 1600px)' },
        'h-5xl': { 'raw': '(min-height: 1800px)' },
        'h-6xl': { 'raw': '(min-height: 2000px)' },
      },

      // Apple-style border radius
      borderRadius: {
        'none': '0',
        'xs': '0.375rem',
        'sm': '0.5rem',
        'DEFAULT': '0.875rem',
        'md': '1rem',
        'lg': '1.25rem',
        'xl': '1.5rem',
        '2xl': '2.2rem',
        '3xl': '2.5rem',
        'full': '9999px',
        'apple': '2.2rem',
        'apple-sm': '0.875rem',
      },

      // SF Pro Display font stack
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },

      // Apple typography scale
      fontSize: {
        'xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0' }],
        'sm': ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '-0.01em' }],
        'base': ['0.9375rem', { lineHeight: '1.375rem', letterSpacing: '-0.01em' }],
        'md': ['1.0625rem', { lineHeight: '1.5rem', letterSpacing: '-0.014em' }],
        'lg': ['1.25rem', { lineHeight: '1.625rem', letterSpacing: '-0.017em' }],
        'xl': ['1.5rem', { lineHeight: '1.875rem', letterSpacing: '-0.019em' }],
        '2xl': ['1.75rem', { lineHeight: '2.125rem', letterSpacing: '-0.021em' }],
        '3xl': ['2.125rem', { lineHeight: '2.5rem', letterSpacing: '-0.022em' }],
        '4xl': ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.024em' }],
        '5xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.025em' }],
      },

      // Apple system colors
      colors: {
        apple: {
          blue: 'var(--apple-blue)',
          'blue-hover': 'var(--apple-blue-hover)',
          green: 'var(--apple-green)',
          'green-hover': 'var(--apple-green-hover)',
          red: 'var(--apple-red)',
          'red-hover': 'var(--apple-red-hover)',
          orange: 'var(--apple-orange)',
          yellow: 'var(--apple-yellow)',
          purple: 'var(--apple-purple)',
          pink: 'var(--apple-pink)',
          teal: 'var(--apple-teal)',
          indigo: 'var(--apple-indigo)',
          gray: {
            50: '#F9F9FB',
            100: '#F2F2F7',
            200: '#E5E5EA',
            300: '#D1D1D6',
            400: '#C7C7CC',
            500: '#AEAEB2',
            600: '#8E8E93',
            700: '#636366',
            800: '#48484A',
            900: '#3A3A3C',
            950: '#1C1C1E',
          }
        },
        surface: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          grouped: 'var(--bg-grouped)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          quaternary: 'var(--text-quaternary)',
        },
        // Accessible info card backgrounds (WCAG AA compliant)
        'info-bg': {
          orange: {
            light: '#FFF3E0',
            dark: '#4E2E1B',
          },
          blue: {
            light: '#E3F2FD',
            dark: '#1A2942',
          },
          green: {
            light: '#E8F5E9',
            dark: '#1B3A1F',
          },
          red: {
            light: '#FFEBEE',
            dark: '#4A1C1C',
          },
        },
        // Accessible text colors (WCAG AA compliant)
        'info-text': {
          orange: {
            light: '#E65100',
            dark: '#FFB74D',
          },
          blue: {
            light: '#1565C0',
            dark: '#64B5F6',
          },
          green: {
            light: '#2E7D32',
            dark: '#81C784',
          },
          red: {
            light: '#C62828',
            dark: '#EF5350',
          },
        },
        // Accessible border colors (WCAG AA compliant)
        'info-border': {
          orange: {
            light: '#FFB74D',
            dark: '#8D5524',
          },
          blue: {
            light: '#42A5F5',
            dark: '#1976D2',
          },
          green: {
            light: '#66BB6A',
            dark: '#388E3C',
          },
          red: {
            light: '#E57373',
            dark: '#C62828',
          },
        },
        // Accessible input borders (WCAG AA compliant)
        'input-border': {
          default: {
            light: '#BDBDBD',
            dark: '#616161',
          },
          hover: {
            light: '#757575',
            dark: '#9E9E9E',
          },
          focus: {
            light: '#1565C0',
            dark: '#42A5F5',
          },
        },
        // Accessible disabled state colors
        disabled: {
          bg: {
            light: '#F5F5F5',
            dark: '#2C2C2C',
          },
          text: {
            light: '#9E9E9E',
            dark: '#757575',
          },
          border: {
            light: '#E0E0E0',
            dark: '#424242',
          },
        },
      },

      // Apple-style shadows
      boxShadow: {
        'apple-sm': 'var(--shadow-apple-sm)',
        'apple-md': 'var(--shadow-apple-md)',
        'apple-lg': 'var(--shadow-apple-lg)',
        'apple-xl': 'var(--shadow-apple-xl)',
        'apple-float': 'var(--shadow-apple-float)',
        'apple-inset': 'var(--shadow-apple-inset)',
        'glass': 'var(--glass-shadow)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.2)',
      },

      // Glass morphism utilities
      backdropBlur: {
        'apple': '24px',
        'glass': '20px',
        'glass-heavy': '40px',
      },

      backdropSaturate: {
        'apple': '180%',
        'glass': '180%',
      },

      // Animation timing functions
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'apple-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'apple-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },

      // Animation durations
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '500': '500ms',
      },

      // Animation keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // Named animations
      animation: {
        'fade-in': 'fadeIn 250ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'fade-out': 'fadeOut 250ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'scale-in': 'scaleIn 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-out': 'scaleOut 150ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'slide-up': 'slideUp 350ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'slide-down': 'slideDown 350ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'slide-in-right': 'slideInRight 350ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'slide-in-left': 'slideInLeft 350ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'bounce-subtle': 'bounceSubtle 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },

      // Additional spacing
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '17': '4.25rem',
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
