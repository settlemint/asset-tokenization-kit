import { Sidebar } from '@/components/ui/sidebar';
import type { PropsWithChildren } from 'react';

export default function NavSidebar({ children }: PropsWithChildren) {
  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-0">
      {children}
    </Sidebar>
  );
}
