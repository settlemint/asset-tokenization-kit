import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { PropsWithChildren } from 'react';
import Header from '../../../components/layout/header';
import { Sidebar } from './_components/sidebar/sidebar';

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="bg-sidebar">
        <Header />
        <main className="flex min-h-screen flex-1 flex-col gap-4 rounded-tl-xl bg-background p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
