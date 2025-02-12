import Header from '@/components/layout/header';
import { NavHeader } from '@/components/layout/nav-header';
import { type NavElement, NavMain } from '@/components/layout/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'Docs',
  description: 'Documentation for the SettleMint Asset Tokenization Platform',
};

export default function DocsLayout({ children }: PropsWithChildren) {
  const sidebarData: NavElement[] = [
    {
      label: 'Asset Tokenization?',
      path: '/docs',
    },
    {
      label: 'The opportunity',
      path: '/docs/opportunity',
    },
    {
      label: 'Use Cases',
      path: '/docs/usecases',
    },
    {
      label: 'Compared to TradFi',
      path: '/docs/vs-tradfi',
    },
    {
      label: 'Challenges',
      path: '/docs/challenges',
    },
    {
      label: 'The way forward',
      path: '/docs/way-forward',
    },
    {
      label: 'Features',
      path: '/docs/features',
    },
    {
      label: 'Get started',
      path: '/docs/get-started',
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
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex min-h-screen flex-1 flex-col gap-4 rounded-tl-xl bg-background p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
