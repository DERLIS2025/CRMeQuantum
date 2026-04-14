import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0f172a',
          700: '#1e293b',
          500: '#334155',
          100: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
};

export default config;
