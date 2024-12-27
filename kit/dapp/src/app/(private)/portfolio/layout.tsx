import Header from '@/app/(private)/_components/header';
import type { SidebarData } from '@/app/(private)/_components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/lib/auth/auth';
import {} from 'lucide-react';
import { headers } from 'next/headers';
import type { PropsWithChildren } from 'react';
import { PrivateSidebar } from '../_components/sidebar';

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
