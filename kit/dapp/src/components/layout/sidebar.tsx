'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {} from 'lucide-react';
import type { ComponentProps } from 'react';
import { NavFooter } from './nav-footer';
import { NavHeader } from './nav-header';
import { type NavElement, NavMain } from './nav-main';
import { TokenDesignerButton } from './token-designer-button';

export function PrivateSidebar({
  items,
  ...props
}: ComponentProps<typeof Sidebar> & {
  role?: 'admin' | 'issuer' | 'user';
  mode?: 'admin' | 'portfolio';
  items: NavElement[];
}) {
  const role = props.role ?? 'user';
  const mode = props.mode ?? 'portfolio';

  return (
    <Sidebar collapsible="icon" {...props}>
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
