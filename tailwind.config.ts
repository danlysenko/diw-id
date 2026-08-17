import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b0b0c',
        panel: '#141416',
        line: '#26262a',
        gold: '#c8a25a',
        goldSoft: '#e4cf9d',
        good: '#3fae6a',
        bad: '#d9534f',
        warn: '#d9a63f',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['-apple-system', 'Inter', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
    },
  },
  plugins: [],
};

export default config;
