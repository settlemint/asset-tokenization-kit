'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { WithdrawUnderlyingAssetsForm } from './form';

export function WithdrawUnderlyingAssetsButton({
  address,
  name,
  symbol,
  decimals,
  disabled,
}: {
  name: string;
  symbol: string;
  address: Address;
  decimals: number;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="dropdown-menu-item w-full justify-start" disabled={disabled}>
          {disabled ? 'Withdraw: No assets available' : 'Withdraw underlying assets'}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Withdraw Assets from {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            Withdraw underlying assets from {name} ({symbol}) by specifying an amount and recipient address.
          </SheetDescription>
        </SheetHeader>
        <WithdrawUnderlyingAssetsForm
          address={address}
          name={name}
          symbol={symbol}
          decimals={decimals}
          assetConfig={assetConfig.stablecoin}
          onCloseAction={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
