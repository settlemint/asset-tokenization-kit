import Header from '@/components/layout/header';
import type { NavElement } from '@/components/layout/nav-main';
import { PrivateSidebar } from '@/components/layout/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
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
      type: 'Item',
      label: 'Portfolio',
      icon: <LayoutDashboard />,
      path: '/portfolio',
    },
    {
      type: 'Item',
      label: 'Transactions',
      icon: <ArrowLeftRight />,
      path: '/portfolio/transactions',
    },
    {
      type: 'Item',
      label: 'My Contacts',
      icon: <Users />,
      path: '/portfolio/contacts',
    },
  ];

  return (
    <SidebarProvider>
      <PrivateSidebar role={role} mode="portfolio" items={sidebarData} />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
