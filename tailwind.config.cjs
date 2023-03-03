module.exports = {
  mode: 'jit',
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  // darkMode: false, // or 'media' or 'class'
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
    },
  },
  plugins: [],
};
