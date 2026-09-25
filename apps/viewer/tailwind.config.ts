import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        filmy: {
          bg: '#0E0E0E',
          surface: '#111111',
          elevated: '#1A1A1A',
          border: '#2A2A2A',
          fg: '#FFFFFF',
          muted: '#A0A0A0',
          accent: '#FDBA4D',
          'accent-hover': '#FFC96A',
          'accent-pressed': '#E5A63C',
          'accent-muted': 'rgba(253, 186, 77, 0.14)',
          'on-accent': '#0E0E0E',
          ghost: '#6B6B6B',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
