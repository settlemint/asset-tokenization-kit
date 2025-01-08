'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { ChartCandlestick, ChevronsUpDown, UserRoundCog } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NavFooter({ mode }: { mode: 'admin' | 'portfolio' }) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                {mode === 'admin' ? <UserRoundCog /> : <ChartCandlestick />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{mode === 'admin' ? 'Admin Mode' : 'Portfolio Mode'}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">Platform modes</DropdownMenuLabel>
            <DropdownMenuItem
              className="flex cursor-pointer items-center justify-between p-2"
              onClick={() => router.push('/admin')}
            >
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md">
                  <UserRoundCog className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Admin Mode</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex cursor-pointer items-center justify-between p-2"
              onClick={() => router.push('/portfolio')}
            >
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md">
                  <ChartCandlestick className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Portfolio Mode</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
