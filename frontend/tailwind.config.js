/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0B1220",
          800: "#111827",
          700: "#1a2332",
          600: "#1e293b",
        },
        electric: {
          500: "#3B82F6",
          400: "#60A5FA",
          300: "#93C5FD",
        },
        cyan: {
          500: "#06B6D4",
          400: "#22D3EE",
        },
        emerald: {
          500: "#10B981",
          400: "#34D399",
        },
        amber: {
          500: "#F59E0B",
          400: "#FBBF24",
        },
        danger: {
          500: "#EF4444",
          400: "#F87171",
        },
        slate: {
          850: "#141C2B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-left": "slideLeft 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "status-pulse": "statusPulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-in": "bounceIn 0.6s cubic-bezier(0.68,-0.55,0.27,1.55)",
        "shimmer": "shimmer 2s linear infinite",
        "grid-move": "gridMove 20s linear infinite",
        "particle-float": "particleFloat 8s ease-in-out infinite",
        "notification-slide": "notificationSlide 0.4s cubic-bezier(0.16,1,0.3,1)",
        "count-up": "countUp 1s ease-out",
        "bar-fill": "barFill 1s ease-out forwards",
        "toast-in": "toastIn 0.4s cubic-bezier(0.16,1,0.3,1)",
        "toast-out": "toastOut 0.3s ease-in forwards",
        "skeleton-loading": "skeletonLoading 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        glowPulse: {
          "0%,100%": { boxShadow: "0 0 15px rgba(59,130,246,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(59,130,246,0.5)" },
        },
        statusPulse: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.5)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gridMove: {
          "0%": { transform: "translate(0,0)" },
          "100%": { transform: "translate(50px,50px)" },
        },
        particleFloat: {
          "0%,100%": { transform: "translateY(0) translateX(0)", opacity: "0.3" },
          "25%": { transform: "translateY(-20px) translateX(10px)", opacity: "0.6" },
          "50%": { transform: "translateY(-10px) translateX(-5px)", opacity: "0.4" },
          "75%": { transform: "translateY(-25px) translateX(15px)", opacity: "0.7" },
        },
        notificationSlide: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        barFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--fill-width)" },
        },
        toastIn: {
          "0%": { transform: "translateX(100%) scale(0.95)", opacity: "0" },
          "100%": { transform: "translateX(0) scale(1)", opacity: "1" },
        },
        toastOut: {
          "0%": { transform: "translateX(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateX(100%) scale(0.95)", opacity: "0" },
        },
        skeletonLoading: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0,0,0,0.36)",
        "glass-sm": "0 4px 16px 0 rgba(0,0,0,0.24)",
        "glow-blue": "0 0 20px rgba(59,130,246,0.3)",
        "glow-cyan": "0 0 20px rgba(6,182,212,0.3)",
        "glow-emerald": "0 0 20px rgba(16,185,129,0.3)",
        "glow-amber": "0 0 20px rgba(245,158,11,0.3)",
        "glow-red": "0 0 20px rgba(239,68,68,0.3)",
        premium: "0 25px 50px -12px rgba(0,0,0,0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
