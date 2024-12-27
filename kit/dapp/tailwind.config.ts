import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import plugin from 'tailwindcss/plugin';
const config: Config = {
  darkMode: ['class'],
  content: ['./{,src/}app/**/*.{js,ts,jsx,tsx,mdx}', './{,src/}components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        'theme-sans': ['Figtree'],
      },
      fontSize: {
        'theme-sm': '1rem',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'theme-md': '14px',
      },
      colors: {
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
          accent: 'hsl(var(--sidebar-accent))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
        },
        lm: {
          lightBlue: 'rgb(52 110 238 / 100%)',
          lightBlue38: 'rgb(52 110 238 / 38%)',
          lightBlue12: 'rgb(52 110 238 / 12%)',
          lightBlueFill: 'rgb(223 231 252 / 100%)',
          blueFill: 'rgb(191 207 255 / 100%)',
          lightBox: 'rgba(52,110,238,0.24)',
          ultraLightBlue: 'rgb(225 234 253 / 100%)',
          ultraLightBlueSoft: 'rgb(240 244 254 / 100%)',
          mediumDarkBlue: 'rgb(10, 42, 84 / 100%)',
          mediumBlue: '#1F52B4',
          darkBlue: '#2770C3',
          darkViolet: '#5b5b82',
          extraDarkBlue: 'rgb(28 28 28 / 87%)',
          lightRed: 'rgb(255 236 236 / 100%)',
          red: '#E01919',
          darkRed: '#E21C1B',
          orange: 'rgb(247 181 0 / 100%)',
          orange12: 'rgb(255 247 236 / 100%)',
          green: 'rgb(137 214 162 / 100%)',
          lightGreen: 'rgb(241 250 244 / 100%)',
          gray: 'rgb(28 28 28 / 38%)',
          gray12: 'rgb(28 28 28 / 12%)',
          gray60: 'rgb(28 28 28 / 60%)',
          gray50: 'rgb(255 255 255 / 50%)',
          lightGray: '#f0f3f5',
          white: '#ffffff',
          white90: 'rgb(251 251 253 / 100%)',
          black: '#000000',
          darkGray: '#979797',
          '1FA2A1': '#1FA2A1',
          E21C1B: '#E21C1B',
          '43496F': '#43496F',
          E84142: '#E84142',
          '2C7DF7': '#2C7DF7',
          F3BA2F: '#F3BA2F',
          F2ECFC: '#F2ECFC',
          '97D6D7with10': 'rgb(151 214 215 / 10%)',
          F1564Awith10: 'rgb(241 86 74 / 10%)',
          purple: '#8e44ad',
        },
        dm: {
          darkBlack: 'rgb(28 28 28 / 100%)',
          darkBlack90: 'rgb(56 56 56 / 100%)',
          darkBlack85: 'rgb(28 28 28 / 85%)',
          darkBlack60: 'rgb(56 56 56 / 60%)',
          darkBlack50: 'rgb(47 47 47 / 100%)',
          darkBlack40: 'rgb(41 41 41 / 100%)',
          lightBlue: 'rgb(77 128 240 / 100%)',
          lightBlue12: 'rgb(77 128 240 / 12%)',
          lightBlue38: 'rgb(77 128 240 / 38%)',
          lightBlueFill: 'rgb(40 53 80 / 100%)',
          lightBox: 'rgba(47,47,47,0.75)',
          gray6: 'rgb(255 255 255 / 6%)',
          gray12: 'rgb(255 255 255 / 12%)',
          gray24: 'rgb(255 255 255 / 24%)',
          white87: 'rgb(255 255 255 / 87%)',
          white60: 'rgb(255 255 255 / 60%)',
          mediumBlue: 'rgb(52 110 238 / 100%)',
          mediumLightBlue: '#1B53BF',
          mediumDarkBlue: 'rgb(53 53 53 / 100%)',
          darkBlue: '#0f2443',
          extraDarkBlue: '#000044',
          darkestBlue: '#051E37',
          white: '#ffffff',
          black: '#000000',
          red: '#FF4D4F',
          red12: 'rgb(73 42 42 / 100%)',
          orange: 'rgb(247 181 0 / 100%)',
          orange12: 'rgb(73 59 42 / 100%)',
          lightGreen: '#346D61',
          green12: 'rgb(49 65 54 / 100%)',
          gray: '#DAE1E5',
          purple: '#8e44ad',
        },
      },
    },
  },
  plugins: [
    animate,
    plugin(
      ({
        addUtilities,
      }: {
        addUtilities: (utilities: Record<string, Record<string, string>>) => void;
      }) => {
        addUtilities({
          '.gradient-button': {
            'box-shadow': '0 -3px 3px 0 rgb(0 0 0 / 21%) inset',
          },
        });
      }
    ),
    require('tailwindcss-animate'),
  ],
};
export default config;
