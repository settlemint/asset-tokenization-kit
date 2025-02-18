'use client';

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Logo } from '../blocks/logo/logo';

export function NavHeader() {
  const { state } = useSidebar();

  return (
    <SidebarMenu className="">
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <div className={cn(state === 'expanded' ? '-mt-2' : 'mt-0 ml-1')}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <Logo variant="icon" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-bold text-lg">SettleMint</span>
              <span className="-mt-1 text-md">Asset Tokenization</span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
