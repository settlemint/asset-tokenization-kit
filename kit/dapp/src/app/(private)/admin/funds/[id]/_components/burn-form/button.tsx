'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { BurnFundForm } from './form';

interface BurnTokensButtonProps {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
}

export function BurnTokensButton({ address, name, symbol, decimals }: BurnTokensButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          Burn tokens
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Burn {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            Burn your {name} ({symbol}) tokens by specifying the amount.
          </SheetDescription>
        </SheetHeader>
        <BurnFundForm
          address={address}
          assetConfig={assetConfig.fund}
          onClose={() => setOpen(false)}
          decimals={decimals}
        />
      </SheetContent>
    </Sheet>
  );
}
