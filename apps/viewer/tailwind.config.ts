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
          card: '#161616',
          accent: '#FDBA4D',
          muted: '#A0A0A0',
        },
      },
    },
  },
  plugins: [],
};

export default config;
