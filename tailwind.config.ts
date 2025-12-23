import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      const rotateUtilities: any = {};
      const values = [0, 5, 10, 15, 20, 30, 45, 75];
      
      ['x', 'y', 'z'].forEach(axis => {
        values.forEach(value => {
          rotateUtilities[`.rotate-${axis}-${value}`] = {
            transform: `rotate${axis.toUpperCase()}(${value}deg)`,
          };
          rotateUtilities[`.-rotate-${axis}-${value}`] = {
            transform: `rotate${axis.toUpperCase()}(-${value}deg)`,
          };
        });
      });

      addUtilities({
        ...rotateUtilities,
        '.perspective-none': { perspective: 'none' },
        '.perspective-1000': { perspective: '1000px' },
        '.transform-style-3d': { 'transform-style': 'preserve-3d' },
        '.backface-hidden': { 'backface-visibility': 'hidden' },
      });
    }),
  ],
};
export default config;
