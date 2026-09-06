import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        panel: '#18191b',
        line: '#2a2b2e',
        paper: '#f7f5f1',
        gold: '#a28f6f',
        goldSoft: '#cbb896',
        good: '#3fae6a',
        bad: '#d9534f',
        warn: '#d9a63f',
        info: '#5b8fd9',
        // The sidebar stays dark and depends on the default neutral-300..700 shades
        // looking light-on-dark; only 50/100/200 (near-white, used for headings and
        // emphasis on the now-light main body, never used by the sidebar) are
        // overridden here so every page's headings flip to dark-on-light for free.
        neutral: {
          50: '#18181b',
          100: '#1f1f22',
          200: '#28282c',
        },
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
