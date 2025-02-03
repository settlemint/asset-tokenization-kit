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
import type { TokenTypeKey } from '@/types/token-types';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

const TOKEN_CONFIGS = {
  Stablecoin: {
    label: 'Stable coin',
    title: 'Design a new stable coin',
    description: 'Digital assets pegged to a stable asset like USD',
  },
  Equity: {
    label: 'Equity',
    title: 'Design a new equity',
    description: 'Digital assets representing ownership in a company',
  },
  Bond: {
    label: 'Bond',
    title: 'Design a new bond',
    description: 'Digital assets representing a debt obligation',
  },
  Cryptocurrency: {
    label: 'Cryptocurrency',
    title: 'Design a new cryptocurrency',
    description: 'Digital assets representing a fully decentralized currency',
  },
  Fund: {
    label: 'Fund',
    title: 'Design a new fund',
    description: 'Digital assets representing a fund',
  },
} as const satisfies Record<TokenTypeKey, { label: string; title: string; description: string }>;

export function TokenDesignerButton() {
  const { state, isMobile } = useSidebar();
  const [tokenType, setTokenType] = useState<TokenTypeKey | null>(null);

  return (
    <SidebarGroup>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex w-full items-center gap-2 text-sidebar-foreground">
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
          {Object.entries(TOKEN_CONFIGS).map(([type, config]) => (
            <DropdownMenuItem key={type} onSelect={() => setTokenType(type as TokenTypeKey)}>
              {config.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={tokenType !== null} onOpenChange={(open) => !open && setTokenType(null)}>
        <SheetContent className="max-h-full w-[50%] overflow-y-auto lg:max-w-[50%]">
          {tokenType && (
            <>
              <SheetHeader>
                <SheetTitle>{TOKEN_CONFIGS[tokenType].title}</SheetTitle>
                <SheetDescription>{TOKEN_CONFIGS[tokenType].description}</SheetDescription>
              </SheetHeader>
              {(() => {
                switch (tokenType) {
                  case 'Cryptocurrency':
                    return <CreateCryptocurrencyForm onClose={() => setTokenType(null)} />;
                  case 'Stablecoin':
                    return <CreateStablecoinForm onClose={() => setTokenType(null)} />;
                  case 'Equity':
                    return <CreateEquityForm onClose={() => setTokenType(null)} />;
                  case 'Bond':
                    return <CreateBondForm onClose={() => setTokenType(null)} />;
                  case 'Fund':
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
