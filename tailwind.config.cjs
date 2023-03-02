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
        primary: '#398DCA',
        // secondary: '#00ff00',
        // tertiary: '#0000ff',
      },
    },
  },
  plugins: [],
};
