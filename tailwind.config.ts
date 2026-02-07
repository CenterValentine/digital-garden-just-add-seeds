import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b0f1a',
        glass: 'rgba(255,255,255,0.2)',
        leaf: '#2d6a4f',
        moss: '#95d5b2'
      },
      boxShadow: {
        glass: '0 10px 40px rgba(0,0,0,0.2)'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Work Sans"', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
