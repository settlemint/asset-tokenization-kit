'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { MintForm } from './form';

export function MintButton({
  address,
  name,
  symbol,
  decimals,
  disabled,
  collateralAvailable,
}: {
  name: string;
  symbol: string;
  address: Address;
  decimals: number;
  disabled?: boolean;
  collateralAvailable: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="dropdown-menu-item w-full justify-start" disabled={disabled}>
          {disabled ? 'Mint: No collateral available' : 'Mint tokens'}
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
        <MintForm
          address={address}
          name={name}
          symbol={symbol}
          decimals={decimals}
          assetConfig={assetConfig.stablecoin}
          onCloseAction={() => setOpen(false)}
          collateralAvailable={collateralAvailable}
        />
      </SheetContent>
    </Sheet>
  );
}
