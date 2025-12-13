/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charte graphique PEM - Enhanced with Premium Grays
        primary: {
          DEFAULT: '#fecb00', // Jaune/Or - Couleur d'accent principale
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fecb00', // Couleur principale
          500: '#fecb00',
          600: '#d4a800',
          700: '#a67c00',
          800: '#7d5d00',
          900: '#523d00',
        },
        pem: {
          gold: '#fecb00',
          'gold-alpha-90': 'rgba(254, 203, 0, 0.9)',
          'gold-alpha-60': 'rgba(254, 203, 0, 0.6)',
        },
        // Premium Greys Ultra-Enrichis (Zinc based with custom shades)
        gray: {
          50: '#fafafa',
          100: '#f4f4f5',
          150: '#ececed',  // Custom - Perfect for subtle backgrounds
          200: '#e4e4e7',
          250: '#d9d9dc',  // Custom - Mid-tone separator
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1f1f22',  // Custom - Deep charcoal
          900: '#18181b',
          950: '#09090b',
        },
        slate: {
          850: '#151f32', // Custom deep slate
        },
        text: {
          primary: '#27272a', // Zinc 800 - Plus profond que le gris standard
          secondary: '#52525b', // Zinc 600
          light: '#a1a1aa', // Zinc 400
          onDark: '#f4f4f5', // Zinc 100
        },
        bg: {
          main: '#f4f4f5', // Zinc 100 - Gris très clair premium
          surface: '#ffffff',
          surfaceAlt: '#fafafa', // Zinc 50
          form: '#f4f4f5',
          dark: '#09090b', // Zinc 950
          'dark-surface': '#18181b', // Zinc 900
        },
        dark: {
          DEFAULT: '#09090b', 
          gray: '#27272a',
          'gray-alt': '#3f3f46',
        },
      },
      fontFamily: {
        primary: ['Oswald', 'sans-serif'], 
        secondary: ['Fira Sans', 'sans-serif'], 
        oswald: ['Oswald', 'sans-serif'],
        fira: ['Fira Sans', 'sans-serif'],
      },
      fontSize: {
        'h1': ['40px', { lineHeight: '50px', letterSpacing: '0px', fontWeight: '400' }],
        'h2': ['24px', { lineHeight: '30px', letterSpacing: '0px', fontWeight: '300' }],
        'h3': ['20px', { lineHeight: '24px', letterSpacing: '0px', fontWeight: '300' }],
        'h4': ['18px', { lineHeight: '22px', letterSpacing: '0px', fontWeight: '700' }],
        'h5': ['14px', { lineHeight: '16px', letterSpacing: '1px', fontWeight: '700' }],
        'body': ['14px', { lineHeight: '18px', letterSpacing: '0px', fontWeight: '400' }],
        'nav': ['16px', { lineHeight: '60px', letterSpacing: '1px', fontWeight: '400' }],
      },
      borderRadius: {
        'pem': '0px', // Style carré conservé
        'xl': '12px',
        '2xl': '16px',
      },
      letterSpacing: {
        'pem-button': '2px',
        'pem-nav': '1px',
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'premium-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

