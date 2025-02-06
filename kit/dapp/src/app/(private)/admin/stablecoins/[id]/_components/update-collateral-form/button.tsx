'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { UpdateCollateralStablecoinForm } from './form';

export function UpdateCollateralButton({ address, name, symbol }: { name: string; symbol: string; address: Address }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          Update proven collateral
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Update {name} ({symbol}) proven collateral
          </SheetTitle>
          <SheetDescription>
            Update the proven collateral for {name} ({symbol}).
          </SheetDescription>
        </SheetHeader>
        <UpdateCollateralStablecoinForm
          address={address}
          name={name}
          symbol={symbol}
          assetConfig={assetConfig.stablecoin}
          onClose={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
