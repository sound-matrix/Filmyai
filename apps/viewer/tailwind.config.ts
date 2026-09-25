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
          bg: '#0a0a0f',
          card: '#16161f',
          accent: '#e50914',
          muted: '#a1a1aa',
        },
      },
    },
  },
  plugins: [],
};

export default config;
