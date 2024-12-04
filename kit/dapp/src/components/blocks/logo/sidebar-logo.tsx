'use client';

import { SidebarMenu, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

export function SidebarLogo() {
  const { open } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex h-12 items-center group-data-[state=collapsed]:h-8">
        <Logo
          variant={open ? 'horizontal' : 'icon'}
          className={cn(
            'relative transition-[width] duration-200 ease-linear',
            'h-9 w-[--sidebar-width]',
            'group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-[--sidebar-width-icon]'
          )}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
