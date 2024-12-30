import Header from '@/components/layout/header';
import type { SidebarData } from '@/components/layout/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/lib/auth/auth';
import {} from 'lucide-react';
import { headers } from 'next/headers';
import type { PropsWithChildren } from 'react';
import { PrivateSidebar } from '../../../components/layout/sidebar';

export default async function PortfolioLayout({ children }: PropsWithChildren) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const role = (session?.user?.role ?? 'user') as 'admin' | 'issuer' | 'user';

  const sidebarData: SidebarData = {
    main: [
      {
        title: 'Token Management',
        items: [
          {
            title: 'Stable Coins',
            iconName: 'coins',
            items: [
              {
                title: 'USDC',
                url: '/admin/stable-coins/usdc',
              },
              {
                title: 'EURC',
                url: '/admin/stable-coins/eurc',
              },
            ],
            more: {
              enabled: true,
              url: '/admin/stable-coins',
            },
          },
        ],
      },
    ],
    secondary: [
      {
        title: 'Administration',
        items: [
          {
            title: 'User Management',
            iconName: 'Users',
            url: '/admin/users',
          },
        ],
      },
    ],
  };

  return (
    <SidebarProvider>
      <PrivateSidebar role={role} mode="portfolio" data={sidebarData} />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
