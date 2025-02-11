'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { MintFundForm } from './form';

export function MintTokensButton({ address, name, symbol }: { name: string; symbol: string; address: Address }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          Mint tokens
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Mint {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            Easily mint your {name} ({symbol}) tokens by selecting a recipient and specifying the amount.
          </SheetDescription>
        </SheetHeader>
        <MintFundForm address={address} assetConfig={assetConfig.fund} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
