'use client';
import {} from '@/components/ui/dropdown-menu';
import {} from '@/components/ui/sheet';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from '@/components/ui/sidebar';
import type { ComponentProps } from 'react';
import { NavFooter } from './nav-footer';
import { NavHeader } from './nav-header';
import { NavMain, type SidebarSection } from './nav-main';
import { NavSecondary, type SidebarSecondarySection } from './nav-secondary';
import { TokenDesignerButton } from './token-designer-button';

export type SidebarData = {
  main: SidebarSection[];
  secondary: SidebarSecondarySection[];
};

export function PrivateSidebar({
  ...props
}: ComponentProps<typeof Sidebar> & {
  role?: 'admin' | 'issuer' | 'user';
  mode?: 'admin' | 'portfolio';
  data: SidebarData;
}) {
  const role = props.role ?? 'user';
  const mode = props.mode ?? 'portfolio';
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mode === 'admin' && <TokenDesignerButton />}
            {props.data.main.map((main) => (
              <NavMain key={main.title} title={main.title} items={main.items} />
            ))}
            {props.data.secondary.map((secondary) => (
              <NavSecondary key={secondary.title} title={secondary.title} items={secondary.items} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {['admin', 'issuer'].includes(role) && (
        <SidebarFooter>
          <NavFooter mode={mode} />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
