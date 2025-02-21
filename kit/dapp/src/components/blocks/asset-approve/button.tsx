'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { ApproveForm } from './form';

export function ApproveButton({
  address,
  name,
  symbol,
  decimals,
  disabled,
  balance,
}: {
  name: string;
  symbol: string;
  address: Address;
  decimals: number;
  disabled?: boolean;
  balance: bigint;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="dropdown-menu-item w-full justify-start" disabled={disabled}>
          {disabled ? 'Approve: No balance available' : 'Approve tokens'}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Setup {name} ({symbol}) allowance
          </SheetTitle>
          <SheetDescription>
            Easily manage and configure the amount of tokens a trusted spender or a smart contract can access. Set an
            allowance to control how many tokens they can spend on your behalf.
          </SheetDescription>
        </SheetHeader>
        <ApproveForm
          address={address}
          name={name}
          symbol={symbol}
          decimals={decimals}
          assetConfig={assetConfig.stablecoin}
          onCloseAction={() => setOpen(false)}
          balance={balance}
        />
      </SheetContent>
    </Sheet>
  );
}
