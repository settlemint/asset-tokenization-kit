'use client';

// import { CreateBondForm } from "@/app/(private)/admin/bonds/_components/create-form/form";
// import { CreateCryptocurrencyForm } from "@/app/(private)/admin/cryptocurrencies/_components/create-form/form";
// import { CreateEquityForm } from "@/app/(private)/admin/equities/_components/create-form/form";
// import { CreateFundForm } from "@/app/(private)/admin/funds/_components/create-form/form";

import { FrameIcon } from '@/components/ui/animated-icons/frame';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarGroup, useSidebar } from '@/components/ui/sidebar';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import { CreateStablecoinForm } from '../../stablecoins/_components/create-form/form';

export function DesignerButton() {
  const { state, isMobile } = useSidebar();
  const [tokenType, setTokenType] = useState<keyof typeof assetConfig | null>(
    null
  );

  return (
    <SidebarGroup className="-mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {state === 'expanded' ? (
            <Button className="mb-4 flex w-full items-center gap-2 text-sidebar-accent dark:text-sidebar-accent-foreground">
              <FrameIcon className="size-4" />
              {state === 'expanded' && <span>Asset Designer</span>}
            </Button>
          ) : (
            <button
              type="button"
              className="mt-2 h-10 w-10 rounded-xl pl-3 hover:bg-sidebar-accent dark:hover:bg-theme-sidebar-accent"
            >
              <FrameIcon className="size-4" />
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="-translate-y-2 ml-4 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-dropdown"
          align="start"
          side={isMobile ? 'bottom' : 'right'}
          sideOffset={4}
        >
          {Object.entries(assetConfig).map(([type, config]) => (
            <DropdownMenuItem
              key={type}
              onSelect={() => setTokenType(type as keyof typeof assetConfig)}
              className="dropdown-menu-item"
            >
              {config.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateStablecoinForm
        open={tokenType === assetConfig.stablecoin.queryKey}
        onCloseAction={() => setTokenType(null)}
      />
    </SidebarGroup>
  );
}
