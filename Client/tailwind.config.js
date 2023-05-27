export default {
  mode: "jit",
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "bg-main-custom": "#7e869e",
        "bg-navbar-custom": "#161b21",
        "bg-login-custom": "#E0E7FF",
        "bg-navbar-gradient-from": "#333",
        "bg-navbar-gradient-to": "#000",
        "bg-home-gradient-from": "#1c92d2  ",
        "bg-home-gradient-to": "#f2fcfe",
      },
      screens: {
        notComputer: "1500px",
      },
    },
  },

  plugins: [],
};
