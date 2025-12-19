// tailwind.config.ts

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
        'arena-green': '#00F0A0',
        'dark-bg': '#020617',
        'card-bg': '#0f172a',
        'border-color': '#334155',
      },
    },
  },
  plugins: [
    // This plugin is essential for styling the Markdown content of problem descriptions.
    require('@tailwindcss/typography'),
  ],
};
export default config;