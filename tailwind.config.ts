import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        panel: '#18191b',
        line: '#2a2b2e',
        paper: '#f1f0ee',
        gold: '#a28f6f',
        goldSoft: '#cbb896',
        good: '#3fae6a',
        bad: '#d9534f',
        warn: '#d9a63f',
        info: '#5b8fd9',
        // The app is light by default (main content) with the sidebar and /admin staying
        // dark (see .theme-dark in globals.css). 50/100/200 (headings) and 400-700 (secondary
        // text) are driven by CSS variables so .theme-dark can flip headings to near-white and
        // lift the mid-greys, which are too dim on black. 300 and 800/900 keep Tailwind's
        // defaults; the sidebar sits outside .theme-dark and is unaffected.
        neutral: {
          50: 'rgb(var(--nt-50) / <alpha-value>)',
          100: 'rgb(var(--nt-100) / <alpha-value>)',
          200: 'rgb(var(--nt-200) / <alpha-value>)',
          400: 'rgb(var(--nt-400) / <alpha-value>)',
          500: 'rgb(var(--nt-500) / <alpha-value>)',
          600: 'rgb(var(--nt-600) / <alpha-value>)',
          700: 'rgb(var(--nt-700) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Circe', '-apple-system', 'Helvetica Neue', 'Inter', 'Arial', 'sans-serif'],
        sans: ['Circe', '-apple-system', 'Inter', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
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
