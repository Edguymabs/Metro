/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charte graphique PEM
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
          gold: '#fecb00', // Jaune/Or principal
          'gold-alpha-90': 'rgba(254, 203, 0, 0.9)',
          'gold-alpha-60': 'rgba(254, 203, 0, 0.6)',
        },
        text: {
          primary: '#4a4a4a', // Gris foncé - Titres
          secondary: '#636363', // Gris moyen - Corps
        },
        bg: {
          main: '#e0e0e0', // Gris clair - Fond principal
          form: '#eceaea', // Gris très clair - Formulaires
        },
        dark: {
          DEFAULT: '#222222', // Noir
          gray: '#4a4a4a',
          'gray-alt': '#4a4949',
        },
      },
      fontFamily: {
        primary: ['Oswald', 'sans-serif'], // Pour titres, navigation, boutons
        secondary: ['Fira Sans', 'sans-serif'], // Pour corps de texte
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
        'pem': '0px', // Style carré de PEM
      },
      letterSpacing: {
        'pem-button': '2px',
        'pem-nav': '1px',
      },
    },
  },
  plugins: [],
}

