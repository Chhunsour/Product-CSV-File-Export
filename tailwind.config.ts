import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
    "./plugins/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Manrope",
          "Space Grotesk",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ],
        display: [
          "Sora",
          "Syne",
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ],
        mono: [
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace"
        ]
      },
      colors: {
        brand: {
          50: "#e8f2ff",
          100: "#cfe4ff",
          200: "#a7ccff",
          300: "#7fb3ff",
          400: "#4f97ff",
          500: "#0a84ff",
          600: "#0a6fe0",
          700: "#0a5ab3",
          800: "#0a478c",
          900: "#0b3a73"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
