import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: ['class', '.dark'],
  content: [
    './{,src/}pages/**/*.{js,ts,jsx,tsx,mdx}',
    './{,src/}components/**/*.{js,ts,jsx,tsx,mdx}',
    './{,src/}app/**/*.{js,ts,jsx,tsx,mdx}',
    './{,src}/mdx-components.tsx',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
      },
      backgroundImage: {
        'lm-gradient-menu':
          'linear-gradient(83deg, #f9f9fc, #d5e0fa 50%, #cdeadd)',
        'dm-gradient-menu':
          'linear-gradient(83deg, #1a1a1a, #1f2937 50%, #1a2e22)',
        'dm-gradient-menu-hover':
          'linear-gradient(83deg, #37393d, #384258 50%, #375b7b)',
      },
      colors: {
        // SettleMint Brand Colors
        sm: {
          'mint-green': 'hsl(var(--sm-mint-green))',
          blue: 'hsl(var(--sm-blue))',
          orange: 'hsl(var(--sm-orange))',
          teal: 'hsl(var(--sm-teal))',
          'light-blue': 'hsl(var(--sm-light-blue))',
          white: 'hsl(var(--sm-white))',
          green: 'hsl(var(--sm-green))',
          'royal-blue': 'hsl(var(--sm-royal-blue))',
          purple: 'hsl(var(--sm-purple))',
          cyan: 'hsl(var(--sm-cyan))',
          'dark-gray': 'hsl(var(--sm-dark-gray))',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        'theme-accent-background': 'hsl(var(--theme-accent-background))',
        'theme-accent-foreground': 'hsl(var(--theme-accent-foreground))',
        'theme-sidebar-accent': 'hsl(var(--theme-sidebar-accent))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': {
            opacity: '1',
          },
          '20%,50%': {
            opacity: '0',
          },
        },
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
      },
      boxShadow: {
        button: '0 -3px 3px 0 rgb(0 0 0 / 21%) inset',
      },
      transitionProperty: {
        theme:
          'background-image, background-color, color, border-color, text-decoration-color, fill, stroke',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
