/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          50: "#EBF2FF",
          100: "#D7E6FF",
          200: "#B0CFFF",
          300: "#89B8FF",
          400: "#62A1FF",
          500: "#3B82F6",
          600: "#0B61EA",
          700: "#084BB5",
          800: "#063480",
          900: "#041E4B",
        },
        secondary: {
          DEFAULT: "#0D9488",
          50: "#ECFFFE",
          100: "#C5F1EE",
          200: "#9EE4E0",
          300: "#77D7D1",
          400: "#50CAC3",
          500: "#0D9488",
          600: "#0A756C",
          700: "#075650",
          800: "#053734",
          900: "#021918",
        },
        accent: {
          DEFAULT: "#F97316",
          50: "#FFF1E7",
          100: "#FFE3CF",
          200: "#FFC79F",
          300: "#FFAC6F",
          400: "#FF903F",
          500: "#F97316",
          600: "#D55A08",
          700: "#A14406",
          800: "#6D2E04",
          900: "#391802",
        },
        success: {
          DEFAULT: "#10B981",
          100: "#ECFDF5",
          500: "#10B981",
          700: "#047857",
        },
        warning: {
          DEFAULT: "#F59E0B",
          100: "#FEF9E7",
          500: "#F59E0B",
          700: "#B45309",
        },
        error: {
          DEFAULT: "#EF4444",
          100: "#FEE2E2",
          500: "#EF4444",
          700: "#B91C1C",
        },
      },
      fontFamily: {
        sans: ["Open Sans", "system-ui", "sans-serif"],
      },
      spacing: {
        128: "32rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
