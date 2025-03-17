import type { Metadata } from 'next';
import StandardOGImage from './metadata/standard-og.png';
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
  generator: 'SettleMint Asset Tokenization Kit',
  description: siteConfig.description,
  keywords: [
    'blockchain',
    'SettleMint',
    'blockchain transformation',
    'asset tokenization',
  ],
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
        url: new URL(StandardOGImage.src, siteConfig.url).toString(),
        width: 1200,
        height: 630,
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
        url: new URL(StandardOGImage.src, siteConfig.url).toString(),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      'en-US': `${siteConfig.url}/en`,
      'de-DE': `${siteConfig.url}/de`,
      'ja-JP': `${siteConfig.url}/ja`,
      'ar-AE': `${siteConfig.url}/ar`,
    },
  },
  other: {
    'darkreader-lock': '',
  },
} as const satisfies Metadata;
