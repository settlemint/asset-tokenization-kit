'use client';

import { CreateBondForm } from '@/app/(private)/admin/bonds/_components/create-form/form';
import { CreateCryptocurrencyForm } from '@/app/(private)/admin/cryptocurrencies/_components/create-form/form';
import { CreateEquityForm } from '@/app/(private)/admin/equities/_components/create-form/form';
import { CreateFundForm } from '@/app/(private)/admin/funds/_components/create-form/form';
import { CreateStablecoinForm } from '@/app/(private)/admin/stablecoins/_components/create-form/form';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SidebarGroup, useSidebar } from '@/components/ui/sidebar';
import { assetConfig } from '@/lib/config/assets';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

export function TokenDesignerButton() {
  const { state, isMobile } = useSidebar();
  const [tokenType, setTokenType] = useState<keyof typeof assetConfig | null>(null);

  return (
    <SidebarGroup>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="mb-4 flex w-full items-center gap-2 text-sidebar-accent dark:text-sidebar-accent-foreground">
            <Pencil className="size-4" />
            {state === 'expanded' && <span>Asset Designer</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          side={isMobile ? 'bottom' : 'right'}
          sideOffset={4}
        >
          {Object.entries(assetConfig).map(([type, config]) => (
            <DropdownMenuItem key={type} onSelect={() => setTokenType(type as keyof typeof assetConfig)}>
              {config.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={tokenType !== null} onOpenChange={(open) => !open && setTokenType(null)}>
        <SheetContent className="max-h-full w-[50%] overflow-y-auto lg:max-w-[50%]">
          {tokenType && (
            <>
              <SheetHeader>
                <SheetTitle>Design a {assetConfig[tokenType].name}</SheetTitle>
                <SheetDescription>{assetConfig[tokenType].description}</SheetDescription>
              </SheetHeader>
              {(() => {
                switch (tokenType) {
                  case 'cryptocurrency':
                    return <CreateCryptocurrencyForm onClose={() => setTokenType(null)} />;
                  case 'stablecoin':
                    return <CreateStablecoinForm onClose={() => setTokenType(null)} />;
                  case 'equity':
                    return <CreateEquityForm onClose={() => setTokenType(null)} />;
                  case 'bond':
                    return <CreateBondForm onClose={() => setTokenType(null)} />;
                  case 'fund':
                    return <CreateFundForm onClose={() => setTokenType(null)} />;
                  default:
                    return null;
                }
              })()}
            </>
          )}
        </SheetContent>
      </Sheet>
    </SidebarGroup>
  );
}
