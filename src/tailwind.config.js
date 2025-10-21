/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./main.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#EBEBEB',
        foreground: '#222222',
        primary: {
          DEFAULT: '#222222',
          foreground: '#EBEBEB',
        },
        secondary: {
          DEFAULT: '#EBEBEB',
          foreground: '#222222',
        },
        border: '#222222',
        ring: '#222222',
      },
    },
  },
  plugins: [],
}
