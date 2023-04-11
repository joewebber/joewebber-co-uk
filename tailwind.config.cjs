/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors')
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        neutral: 'rgb(var(--color-neutral) / <alpha-value>)',
        heading: colors.gray[800],
        copy: colors.gray[500],
        black: colors.black,
        white: colors.white,
        red: colors.red,
      },
      fontFamily: {
        sans: ['var(--sans-font)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
}
