'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { RedeemBondForm } from './form';

export function RedeemBondButton({
  address,
  name,
  symbol,
  decimals,
  balance,
  assetConfig,
}: {
  name: string;
  symbol: string;
  address: Address;
  assetConfig: AssetDetailConfig;
  decimals: number;
  balance: number;
}) {
  const [open, setOpen] = useState(false);
  const disabled = balance <= 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="dropdown-menu-item w-full justify-start" disabled={disabled}>
          {disabled ? 'Redeem: No balance available' : 'Redeem bond'}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Redeem {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            Redeem your bond tokens to receive the underlying assets. Make sure you understand the redemption terms and
            conditions before proceeding.
          </SheetDescription>
        </SheetHeader>
        <RedeemBondForm
          address={address}
          symbol={symbol}
          decimals={decimals}
          assetConfig={assetConfig}
          onCloseAction={() => setOpen(false)}
          balance={balance}
        />
      </SheetContent>
    </Sheet>
  );
}
