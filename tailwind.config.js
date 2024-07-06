/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './src/routes/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#27374D',
        secondary: '#526D82',
        accent: '#9DB2BF',
        background: '#DDE6ED',
      },
    },
  },
  plugins: [],
}

