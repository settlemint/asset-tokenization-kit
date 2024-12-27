import { AdminSidebar } from '@/app/(private)/admin/_components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { PropsWithChildren } from 'react';
import Header from '../_components/header';

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
