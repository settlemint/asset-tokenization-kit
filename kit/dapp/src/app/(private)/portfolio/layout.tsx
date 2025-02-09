import Header from '@/components/layout/header';
import { NavFooter } from '@/components/layout/nav-footer';
import { NavHeader } from '@/components/layout/nav-header';
import { type NavElement, NavMain } from '@/components/layout/nav-main';
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
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { metadata as baseMetadata } from '@/lib/config/metadata';
import { ArrowLeftRight, LayoutDashboard, Users, Wallet } from 'lucide-react';
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

export default async function PortfolioLayout({ children }: PropsWithChildren) {
  const user = await getAuthenticatedUser();
  const role = (user?.role ?? 'user') as 'admin' | 'issuer' | 'user';

  const sidebarData: NavElement[] = [
    {
      label: 'Portfolio',
      icon: <LayoutDashboard />,
      path: '/portfolio',
    },
    {
      label: 'My Assets',
      icon: <Wallet />,
      path: '/portfolio/my-assets',
    },
    {
      label: 'Transactions',
      icon: <ArrowLeftRight />,
      path: '/portfolio/transactions',
    },
    {
      label: 'My Contacts',
      icon: <Users />,
      path: '/portfolio/contacts',
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="group-data-[side=left]:border-0">
        <SidebarHeader>
          <NavHeader />
        </SidebarHeader>
        <SidebarContent className="pt-4">
          <NavMain items={sidebarData} />
        </SidebarContent>
        {['admin', 'issuer'].includes(role) && (
          <>
            <SidebarSeparator />
            <SidebarFooter>
              <NavFooter mode="portfolio" />
            </SidebarFooter>
          </>
        )}
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex min-h-screen flex-1 flex-col gap-4 rounded-tl-xl bg-background p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
