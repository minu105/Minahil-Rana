import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: { soft: '0 6px 30px rgba(0,0,0,0.07)' }
    },
  },
  plugins: [],
};
export default config;