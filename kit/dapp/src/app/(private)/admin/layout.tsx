import type { NavElement } from '@/components/layout/nav-main';
import { PrivateSidebar } from '@/components/layout/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/lib/auth/auth';
import { AlertTriangle, ArrowRightLeft, LayoutDashboard, Settings, Users } from 'lucide-react';
import { headers } from 'next/headers';
import type { PropsWithChildren } from 'react';
import Header from '../../../components/layout/header';
import { createTokenManagementNavGroup } from './_lib/dynamic-navigation';

export default async function AdminLayout({ children }: PropsWithChildren) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const role = (session?.user?.role ?? 'user') as 'admin' | 'issuer' | 'user';
  const tokenManagementNavGroup = await createTokenManagementNavGroup(role);
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
    ...(tokenManagementNavGroup ? [tokenManagementNavGroup] : []),
    {
      label: 'User management',
      icon: <Users />,
      path: '/users',
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
