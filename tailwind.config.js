import { nextui } from '@nextui-org/react'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f97316',
        secondary: '#ef4444',
        dark: '#1c1917',
      },
      fontFamily: {
        sans: ['"Nunito"', '"Noto Sans SC"', 'sans-serif'],
        mono: ['"SF Mono"', '"Roboto Mono"', '"Menlo"', 'monospace'],
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      light: {
        colors: {
          primary: {
            DEFAULT: "#f97316",
            foreground: "#ffffff",
          },
          danger: {
            DEFAULT: "#ef4444",
            foreground: "#ffffff",
          },
          success: {
            DEFAULT: "#10b981",
            foreground: "#ffffff",
          },
        },
      },
      dark: {
        colors: {
          primary: {
            DEFAULT: "#f97316",
            foreground: "#ffffff",
          },
          danger: {
            DEFAULT: "#ef4444",
            foreground: "#ffffff",
          },
          success: {
            DEFAULT: "#10b981",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
}
