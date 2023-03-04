// const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      width: {
        '240': '240px'
      },
      colors: {
        primary: '#0563B2',
        secondary: '#dfe9f5',
        // tertiary: '#0000ff',
      },
      // fontWeight: ['hover', 'focus'],
      // fontFamily: {
      //   sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      // },
    },
  },
  variants: {},
  plugins: []
};