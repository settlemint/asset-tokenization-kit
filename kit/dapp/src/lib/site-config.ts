import type { Metadata } from 'next';

/**
 * Interface defining the site's theme configuration
 */
interface ThemeConfig {
  /** The theme variant to use throughout the application */
  variant: 'settlemint' | 'shadcn';
  /** Whether dark mode is enabled by default */
  defaultDarkMode: boolean;
}

/**
 * Interface defining the site's configuration
 */
interface SiteConfig {
  /** The name of the site */
  name: string;
  /** The description of the site */
  description: string;
  /** The base URL of the site */
  url: string;
}

/**
 * The main site configuration
 */
export const siteConfig = {
  name: 'Asset Tokenization',
  description: 'SettleMint Asset Tokenization Starter Kit',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const satisfies SiteConfig;

/**
 * The theme configuration
 */
export const themeConfig = {
  variant: 'settlemint',
  defaultDarkMode: false,
} as const satisfies ThemeConfig;

/**
 * Next.js metadata configuration for SEO and site presentation
 */
export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['blockchain', 'SettleMint', 'blockchain transformation', 'asset tokenization'],
  authors: [{ name: 'SettleMint', url: 'https://www.settlemint.com' }],
  creator: 'SettleMint',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: '@SettleMint',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  other: {
    'darkreader-lock': '',
  },
} as const satisfies Metadata;
