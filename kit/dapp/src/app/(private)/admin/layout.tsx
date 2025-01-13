import { PrivateSidebar, type SidebarData } from '@/components/layout/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/lib/auth/auth';
import type { User } from '@/lib/auth/types';
import { headers } from 'next/headers';
import type { PropsWithChildren } from 'react';
import Header from '../../../components/layout/header';
import { createMainSideBarData } from './_lib/dynamic-navigation';

export default async function AdminLayout({ children }: PropsWithChildren) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const role = (session?.user?.role ?? 'user') as 'admin' | 'issuer' | 'user';

  const { users } = await auth.api.listUsers({
    query: {
      limit: Number.MAX_SAFE_INTEGER,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    },
    headers: await headers(),
  });

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
    users: users as User[],
  };

  return (
    <SidebarProvider>
      <PrivateSidebar role={role} mode="admin" data={sidebarData} className="group-data-[side=left]:border-0" />
      <SidebarInset className="bg-sidebar">
        <Header />
        <main className="min-h-screen flex-1 rounded-tl-xl bg-background pt-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
