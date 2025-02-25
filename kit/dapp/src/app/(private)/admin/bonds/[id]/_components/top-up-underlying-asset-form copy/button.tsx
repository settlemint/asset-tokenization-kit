'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { TopUpUnderlyingAssetsForm } from './form';

export function TopUpUnderlyingAssetsButton({
  address,
  name,
  symbol,
  decimals,
  underlyingAssetAddress,
  disabled,
}: {
  name: string;
  symbol: string;
  address: Address;
  decimals: number;
  underlyingAssetAddress: Address;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="dropdown-menu-item w-full justify-start" disabled={disabled}>
          {disabled ? 'Top Up: Not available' : 'Top up underlying assets'}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Top Up Assets for {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            Add more underlying assets to {name} ({symbol}) by specifying an amount.
          </SheetDescription>
        </SheetHeader>
        <TopUpUnderlyingAssetsForm
          address={address}
          name={name}
          symbol={symbol}
          decimals={decimals}
          underlyingAssetAddress={underlyingAssetAddress}
          assetConfig={assetConfig.stablecoin}
          onCloseAction={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
