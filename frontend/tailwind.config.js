/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14101F',
        inksoft: '#1E1830',
        paper: '#FAF5EC',
        poster: '#FFC53D',
        vibepink: '#FF3EA5',
        vipteal: '#2DD4BF',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
