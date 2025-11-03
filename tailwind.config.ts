import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'arena-pink': '#FF99D8',
        'arena-purple': '#CEA8F0',
        'arena-blue': '#89BBE4',
        'arena-mint': '#99FFCE',
        'dark-bg': '#0f172a',
        'card-bg': '#1e293b',
        'border-color': '#334155',
      },
    },
  },
  plugins: [],
};
export default config;