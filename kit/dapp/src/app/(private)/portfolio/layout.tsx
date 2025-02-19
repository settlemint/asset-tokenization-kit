import Header from '@/components/layout/header';
import { NavFooter } from '@/components/layout/nav-footer';
import { NavHeader } from '@/components/layout/nav-header';
import { type NavElement, NavMain } from '@/components/layout/nav-main';
import { ActivityIcon } from '@/components/ui/animated-icons/activity';
import { ChartScatterIcon } from '@/components/ui/animated-icons/chart-scatter';
import { UsersIcon } from '@/components/ui/animated-icons/users';
import { WalletIcon } from '@/components/ui/animated-icons/wallet';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { metadata as baseMetadata } from '@/lib/config/metadata';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

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
  const sidebarData: NavElement[] = [
    {
      label: 'Portfolio',
      icon: <ChartScatterIcon className="h-4 w-4" />,
      path: '/portfolio',
    },
    {
      label: 'My Assets',
      icon: <WalletIcon className="h-4 w-4" />,
      path: '/portfolio/my-assets',
    },
    {
      label: 'Transactions',
      icon: <ActivityIcon className="h-4 w-4" />,
      path: '/portfolio/transactions',
    },
    {
      label: 'My Contacts',
      icon: <UsersIcon className="h-4 w-4" />,
      path: '/portfolio/contacts',
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="group-data-[side=left]:border-0">
        <SidebarHeader>
          <NavHeader />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={sidebarData} />
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <NavFooter />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex min-h-screen flex-1 flex-col gap-4 rounded-tl-xl bg-background p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
