'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { FreezeFundForm } from './form';

interface FreezeTokensButtonProps {
  address: Address;
  name: string;
  symbol: string;
}

export function FreezeTokensButton({ address, name, symbol }: FreezeTokensButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          Freeze account in {assetConfig.fund.name.toLowerCase()}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Freeze Account in {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            Freeze an account in {name} ({symbol}) to prevent transfers.
          </SheetDescription>
        </SheetHeader>
        <FreezeFundForm address={address} assetConfig={assetConfig.fund} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
