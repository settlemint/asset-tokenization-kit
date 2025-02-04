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
import { auth } from '@/lib/auth/auth';
import { ArrowLeftRight, LayoutDashboard, Users } from 'lucide-react';
import { headers } from 'next/headers';
import type { PropsWithChildren } from 'react';

export default async function PortfolioLayout({ children }: PropsWithChildren) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const role = (session?.user?.role ?? 'user') as 'admin' | 'issuer' | 'user';

  const sidebarData: NavElement[] = [
    {
      label: 'Portfolio',
      icon: <LayoutDashboard />,
      path: '/portfolio',
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
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
