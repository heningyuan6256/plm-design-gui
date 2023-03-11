// const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      width: {
        240: "240px",
      },
      colors: {
        primary: "#0563B2",
        secondary: "#dfe9f5",
        base: "#FAFBFF",
        littleGrey: "#A7B3C5",
        hoverBg: "#eff2f7",
        baseHover: "#eff2f7",
        outBorder: '#E9EBED'
      },
      height: {
        68: "68px",
      },
      padding: {
        3.5: "10px",
      },
      boxShadow: {
        "1xl": "0px 0px 0px 3px #eff2f7",
      },
      // fontWeight: ['hover', 'focus'],
      // fontFamily: {
      //   sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      // },
    },
  },
  variants: {},
  plugins: [],
};
