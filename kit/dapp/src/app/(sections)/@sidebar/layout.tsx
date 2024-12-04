import { SidebarLogo } from '@/components/blocks/logo/sidebar-logo';
import { NavUser } from '@/components/side-bar/sidebar-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';

export default function SidebarLayout({ children }: PropsWithChildren) {
  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <Link href="/">
          <SidebarLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent>{children} </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
