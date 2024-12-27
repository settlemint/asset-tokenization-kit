'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import SettleMintIcon from '@/public/logos/settlemint-logo-i-dm.svg';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { ChartCandlestick, ChevronsUpDown, PencilRuler } from 'lucide-react';
import Image from 'next/image';

export function NavHeader({
  admin,
}: {
  admin?: boolean;
}) {
  const { isMobile } = useSidebar();

  if (!admin) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <a href="http://somewhere.com">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                <Image src={SettleMintIcon} alt="SettleMint" width={32} height={32} />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold">SettleMint</span>
                <span className="text-xs">Asset Tokenization</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                <Image src={SettleMintIcon} alt="SettleMint" width={32} height={32} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Asset Tokenization</span>
                <span className="truncate text-xs">Admin Mode</span>
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
            <DropdownMenuItem className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md">
                  <PencilRuler className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Admin Mode</div>
              </div>
              <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md">
                  <ChartCandlestick className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Portfolio Mode</div>
              </div>
              <DropdownMenuShortcut>⌘2</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
