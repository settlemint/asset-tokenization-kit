'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { MatureBondForm } from './form';

export function MatureBondButton({
  address,
  name,
  symbol,
  disabled,
}: {
  name: string;
  symbol: string;
  address: Address;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="dropdown-menu-item w-full justify-start" disabled={disabled}>
          {disabled ? 'Mature: Bond not eligible for maturation' : 'Mature Bond'}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Mature Bond {name} ({symbol})
          </SheetTitle>
          <SheetDescription>Mature this bond to receive the principal and any accrued interest.</SheetDescription>
        </SheetHeader>
        <MatureBondForm
          address={address}
          name={name}
          symbol={symbol}
          assetConfig={assetConfig.stablecoin}
          onCloseAction={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
