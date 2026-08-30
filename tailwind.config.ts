import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        panel: '#18191b',
        line: '#2a2b2e',
        gold: '#a28f6f',
        goldSoft: '#cbb896',
        good: '#3fae6a',
        bad: '#d9534f',
        warn: '#d9a63f',
        info: '#5b8fd9',
      },
      fontFamily: {
        display: ['-apple-system', 'Helvetica Neue', 'Inter', 'Arial', 'sans-serif'],
        sans: ['-apple-system', 'Inter', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.28em',
        wide3: '0.12em',
      },
    },
  },
  plugins: [],
};

export default config;
