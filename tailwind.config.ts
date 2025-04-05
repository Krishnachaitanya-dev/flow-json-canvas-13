
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        nvr: {
          red: '#e63946',
          blue: '#0077b6',
          green: '#2a9d8f',
          yellow: '#ffb703',
        },
        futuristic: {
          blue: '#4361EE',
          purple: '#7209B7',
          pink: '#F72585',
          cyan: '#4CC9F0',
          teal: '#06D6A0',
          yellow: '#FFD60A',
          orange: '#FB5607',
          red: '#D62828',
          dark: '#03071E',
          light: '#E9ECEF',
          gradient1: 'linear-gradient(90deg, #4361EE, #7209B7)',
          gradient2: 'linear-gradient(90deg, #F72585, #4361EE)',
          gradient3: 'linear-gradient(90deg, #06D6A0, #4CC9F0)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(74, 222, 128, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(74, 222, 128, 0.6)' },
        },
        'rotate-3d': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'rotate-3d': 'rotate-3d 10s linear infinite',
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.futuristic.blue"), 0 0 20px theme("colors.futuristic.cyan")',
        'neon-pink': '0 0 5px theme("colors.futuristic.pink"), 0 0 20px theme("colors.futuristic.purple")',
        'neon-green': '0 0 5px theme("colors.futuristic.teal"), 0 0 20px theme("colors.futuristic.cyan")',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'futuristic-grid': 'linear-gradient(rgba(25, 25, 25, 0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(25, 25, 25, 0.9) 1px, transparent 1px)',
      },
      backdropFilter: {
        'glass': 'blur(4px) saturate(180%)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
