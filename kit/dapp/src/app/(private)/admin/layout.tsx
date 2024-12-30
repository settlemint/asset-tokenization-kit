import { PrivateSidebar, type SidebarData } from '@/components/layout/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import type { PropsWithChildren } from 'react';
import Header from '../../../components/layout/header';
import { createMainSideBarData } from './_lib/dynamic-navigation';

export default async function AdminLayout({ children }: PropsWithChildren) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const role = (session?.user?.role ?? 'user') as 'admin' | 'issuer' | 'user';

  const sidebarData: SidebarData = {
    main: await createMainSideBarData(role),
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
      <PrivateSidebar role={role} mode="admin" data={sidebarData} />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
