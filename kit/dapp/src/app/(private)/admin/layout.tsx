import type { NavElement } from '@/components/layout/nav-main';
import { PrivateSidebar } from '@/components/layout/private-sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/lib/auth/auth';
import { AlertTriangle, ArrowRightLeft, LayoutDashboard, Settings, Users } from 'lucide-react';
import { headers } from 'next/headers';
import type { PropsWithChildren } from 'react';
import Header from '../../../components/layout/header';

export default async function AdminLayout({ children }: PropsWithChildren) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const role = (session?.user?.role ?? 'user') as 'admin' | 'issuer' | 'user';

  const defaultNavItems: NavElement[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard />,
      path: '/admin',
    },
    {
      label: 'Actions',
      icon: <AlertTriangle />,
      path: '/actions',
      badge: '12',
    },
    {
      groupTitle: 'Token management',
      items: [
        {
          label: 'Crypto Currencies',
          path: '/admin/cryptocurrencies',
          icon: (
            <Avatar className="h-4 w-4 border border-foreground-muted">
              <AvatarFallback className="text-[7px]">CC</AvatarFallback>
            </Avatar>
          ),
        },
        {
          label: 'Stable Coins',
          path: '/admin/stablecoins',
          icon: (
            <Avatar className="h-4 w-4 border border-foreground-muted">
              <AvatarFallback className="text-[7px]">SC</AvatarFallback>
            </Avatar>
          ),
        },
        {
          label: 'Equities',
          path: '/admin/equities',
          icon: (
            <Avatar className="h-4 w-4 border border-foreground-muted">
              <AvatarFallback className="text-[7px]">EQ</AvatarFallback>
            </Avatar>
          ),
        },
        {
          label: 'Bonds',
          path: '/admin/bonds',
          icon: (
            <Avatar className="h-4 w-4 border border-foreground-muted">
              <AvatarFallback className="text-[7px]">BN</AvatarFallback>
            </Avatar>
          ),
        },
        {
          label: 'Funds',
          path: '/admin/funds',
          icon: (
            <Avatar className="h-4 w-4 border border-foreground-muted">
              <AvatarFallback className="text-[7px]">FN</AvatarFallback>
            </Avatar>
          ),
        },
      ],
    },
    {
      label: 'User management',
      icon: <Users />,
      path: '/admin/users',
    },
    {
      label: 'Transactions',
      icon: <ArrowRightLeft />,
      path: '/transactions',
    },
    {
      label: 'Settings',
      icon: <Settings />,
      path: '/settings',
    },
  ];

  return (
    <SidebarProvider>
      <PrivateSidebar role={role} mode="admin" items={defaultNavItems} />
      <SidebarInset className="bg-sidebar">
        <Header />
        <main className="flex min-h-screen flex-1 flex-col gap-4 rounded-tl-xl bg-background p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
