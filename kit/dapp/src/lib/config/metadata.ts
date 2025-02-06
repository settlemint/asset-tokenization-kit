import type { QueryKey } from '@tanstack/react-query';
import type { Metadata } from 'next';
import StandardOGImage from './metadata/standard-og.png' assert { type: 'image' };
import { siteConfig } from './site';

/**
 * Next.js metadata configuration for SEO and site presentation
 */
export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  applicationName: siteConfig.name,
  generator: 'SettleMint Asset Tokenization Starter Kit',
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
    images: [
      {
        url: StandardOGImage.src,
        width: 1280,
        height: 640,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: '@SettleMintCom',
    images: [
      {
        url: StandardOGImage.src,
        width: 1280,
        height: 640,
        alt: siteConfig.name,
      },
    ],
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

export interface AssetDetailConfig {
  name: string;
  pluralName: string;
  description: string;
  factoryAddress: string;
  queryKey: QueryKey;
  urlSegment: string;
}
