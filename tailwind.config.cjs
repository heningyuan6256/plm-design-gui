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
        base: "#f1f1f1",
        littleGrey: "#7b7a7a",
        hoverBg: "#eff2f7",
        baseHover: "#eff2f7",
        outBorder: "#CDCDCD",
        hoverHeadButton: "rgba(57,141,202,0.50)",
        tabTitleBg: "#ECEDF0",
        hoverBlue: '#ddeffe'
      },
      height: {
        76: "76px",
      },
      padding: {
        3.5: "10px",
        3: "6px",
        0.45: "7px",
      },
      gap: {
        1.5: "6px",
      },
      boxShadow: {
        "1xl": "0px 0px 0px 3px #eff2f7",
        "2xl": "0px 0px 0px 6px rgba(57,141,202,0.50)",
        '3xl': '0px 0px 0px 3px #ddeffe'
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
