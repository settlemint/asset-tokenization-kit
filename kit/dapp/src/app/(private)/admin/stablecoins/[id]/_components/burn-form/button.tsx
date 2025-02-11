'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { BurnStablecoinForm } from './form';

export function BurnTokensButton({
  address,
  name,
  symbol,
  decimals,
}: { name: string; symbol: string; address: Address; decimals: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="dropdown-menu-item w-full justify-start">
          Burn tokens
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Burn {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            Easily burn your {name} ({symbol}) tokens by selecting a recipient and specifying the amount.
          </SheetDescription>
        </SheetHeader>
        <BurnStablecoinForm
          address={address}
          name={name}
          symbol={symbol}
          decimals={decimals}
          assetConfig={assetConfig.stablecoin}
          onClose={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
