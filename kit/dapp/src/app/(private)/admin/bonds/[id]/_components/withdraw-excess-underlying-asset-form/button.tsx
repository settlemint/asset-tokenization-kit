'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { WithdrawExcessUnderlyingAssetsForm } from './form';

export function WithdrawExcessUnderlyingAssetsButton({
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
          {disabled ? 'Withdraw: No excess assets available' : 'Withdraw excess underlying assets'}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Withdraw Excess Assets from {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            Withdraw excess underlying assets from {name} ({symbol}) by specifying a recipient address.
          </SheetDescription>
        </SheetHeader>
        <WithdrawExcessUnderlyingAssetsForm
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
