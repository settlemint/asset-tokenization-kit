import NavInset from '@/components/layout/nav-inset';
import NavProvider from '@/components/layout/nav-provider';
import { metadata as baseMetadata } from '@/lib/config/metadata';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { PortfolioSidebar } from './_components/sidebar/sidebar';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'View and manage your tokenized asset portfolio.',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Portfolio',
    description: 'View and manage your tokenized asset portfolio.',
    images: [
      {
        // TODO: Replace with actual user address when authentication is implemented
        url: '/api/og/portfolio?address=0x0000000000000000000000000000000000000000',
        width: 1200,
        height: 630,
        alt: 'Portfolio Overview',
      },
    ],
  },
  twitter: {
    ...baseMetadata.twitter,
    title: 'Portfolio',
    description: 'View and manage your tokenized asset portfolio.',
    images: [
      {
        // TODO: Replace with actual user address when authentication is implemented
        url: '/api/og/portfolio?address=0x0000000000000000000000000000000000000000',
        width: 1200,
        height: 630,
        alt: 'Portfolio Overview',
      },
    ],
  },
};

export default function PortfolioLayout({ children }: PropsWithChildren) {
  return (
    <NavProvider>
      <PortfolioSidebar />
      <NavInset>{children}</NavInset>
    </NavProvider>
  );
}
