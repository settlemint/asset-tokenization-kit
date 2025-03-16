import { SidebarProvider } from '@/components/ui/sidebar';
import type { PropsWithChildren } from 'react';

export default function NavProvider({ children }: PropsWithChildren) {
  return (
    <SidebarProvider className="SidebarProvider">{children}</SidebarProvider>
  );
}
