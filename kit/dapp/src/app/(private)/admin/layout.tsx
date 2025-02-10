import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import type { CSSProperties, PropsWithChildren } from 'react';
import Header from '../../../components/layout/header';
import { Sidebar } from './_components/sidebar/sidebar';

export default async function AdminLayout({ children }: PropsWithChildren) {
  const user = await getAuthenticatedUser();
  if (!['admin', 'issuer'].includes(user.role ?? '')) {
    redirect('/auth/wrong-role');
  }

  return (
    <SidebarProvider className="SidebarProvider" style={{ '--sidebar-width-icon': '4.5rem' } as CSSProperties}>
      <Sidebar />
      <SidebarInset className="bg-sidebar">
        <Header />
        <main className="flex min-h-[calc(100vh-90px)] flex-1 flex-col gap-4 rounded-tl-xl bg-background p-10">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
