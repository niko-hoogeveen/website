import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-from-bottom": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-from-top": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-delay-100": "fade-in 0.7s ease-out 0.1s both",
        "fade-in-delay-200": "fade-in 0.7s ease-out 0.2s both",
        "fade-in-delay-300": "fade-in 0.7s ease-out 0.3s both",
        "fade-in-delay-400": "fade-in 0.7s ease-out 0.4s both",
        "slide-in-bottom": "slide-in-from-bottom 0.7s ease-out",
        "slide-in-bottom-delay-100": "slide-in-from-bottom 0.7s ease-out 0.1s both",
        "slide-in-bottom-delay-200": "slide-in-from-bottom 0.7s ease-out 0.2s both",
        "slide-in-bottom-delay-300": "slide-in-from-bottom 0.7s ease-out 0.3s both",
        "slide-in-bottom-delay-400": "slide-in-from-bottom 0.7s ease-out 0.4s both",
        "slide-in-top": "slide-in-from-top 0.5s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
