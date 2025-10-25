/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        main: "var(--color-main)",
        secondary: "var(--color-secondary)",
        label: "var(--color-label)",
        background: "var(--color-background)",
        card: "var(--color-card-background)",
      },
    },
  },
  plugins: [],
};
