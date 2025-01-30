'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { NavFooter } from './nav-footer';
import { NavHeader } from './nav-header';
import { type NavElement, NavMain } from './nav-main';
import { TokenDesignerButton } from './token-designer-button';

interface PrivateSidebarProps {
  role: 'admin' | 'issuer' | 'user';
  mode: 'portfolio' | 'admin';
  items: NavElement[];
}

export function PrivateSidebar({ role, mode, items }: PrivateSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-0">
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        {mode === 'admin' && <TokenDesignerButton />}
        <NavMain items={items} />
      </SidebarContent>
      {['admin', 'issuer'].includes(role) && (
        <>
          <SidebarSeparator />
          <SidebarFooter>
            <NavFooter mode={mode} />
          </SidebarFooter>
        </>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
