import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0f1117',
          panel: '#1a1d27',
          accent: '#3b82f6',
          muted: '#9ca3af',
        },
      },
    },
  },
  plugins: [],
};

export default config;
