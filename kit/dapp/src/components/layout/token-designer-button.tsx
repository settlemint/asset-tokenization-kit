'use client';

import { CreateTokenForm } from '@/app/(private)/admin/tokens/_components/create-token-form/create-token-form';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SidebarGroup, useSidebar } from '@/components/ui/sidebar';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

export type TokenType = 'stablecoin' | 'equity' | 'bond' | 'cryptocurrency';

const TOKEN_CONFIGS = {
  stablecoin: {
    label: 'Stable coin',
    title: 'Design a new stable coin token',
    description: 'Digital assets pegged to a stable asset like USD',
  },
  equity: {
    label: 'Equity',
    title: 'Design a new equity token',
    description: 'Digital assets representing ownership in a company',
  },
  bond: {
    label: 'Bond',
    title: 'Design a new bond token',
    description: 'Digital assets representing a debt obligation',
  },
  cryptocurrency: {
    label: 'Cryptocurrency',
    title: 'Design a new cryptocurrency token',
    description: 'Digital assets representing a fully decentralized currency',
  },
} as const satisfies Record<TokenType, { label: string; title: string; description: string }>;

export function TokenDesignerButton() {
  const { state, isMobile } = useSidebar();
  const [openSheet, setOpenSheet] = useState<TokenType | null>(null);

  return (
    <SidebarGroup>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex w-full items-center gap-2 text-sidebar-foreground">
            <Pencil className="size-4" />
            {state === 'expanded' && <span>Token Designer</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          side={isMobile ? 'bottom' : 'right'}
          sideOffset={4}
        >
          {Object.entries(TOKEN_CONFIGS).map(([type, config]) => (
            <DropdownMenuItem key={type} onSelect={() => setOpenSheet(type as TokenType)}>
              {config.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={openSheet !== null} onOpenChange={(open) => !open && setOpenSheet(null)}>
        <SheetContent className="w-[50%] lg:max-w-[50%]">
          {openSheet && (
            <>
              <SheetHeader>
                <SheetTitle>{TOKEN_CONFIGS[openSheet].title}</SheetTitle>
                <SheetDescription>{TOKEN_CONFIGS[openSheet].description}</SheetDescription>
              </SheetHeader>
              <div className="p-8">
                <CreateTokenForm formId="create-token-form" tokenType={openSheet} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </SidebarGroup>
  );
}
