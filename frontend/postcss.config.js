export default {
  // PostCSS runs Tailwind first so utility classes compile before vendor prefixes.
  plugins: {
    // Tailwind generates the design-system utilities used throughout the React app.
    tailwindcss: {},
    // Autoprefixer adds browser prefixes needed by the compiled CSS output.
    autoprefixer: {},
  },
}
