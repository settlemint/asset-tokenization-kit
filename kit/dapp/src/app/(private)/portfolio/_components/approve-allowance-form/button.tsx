'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { ApproveAllowanceForm } from './form';
import type { ApproveFormAssetType } from './schema';

export function ApproveAllowanceButton({
  address,
  name,
  symbol,
  decimals,
  balance,
  assetType,
  assetConfig,
}: {
  name: string;
  symbol: string;
  address: Address;
  assetType: ApproveFormAssetType;
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
        <ApproveAllowanceForm
          address={address}
          name={name}
          symbol={symbol}
          decimals={decimals}
          assetConfig={assetConfig}
          onCloseAction={() => setOpen(false)}
          balance={balance}
          assetType={assetType}
        />
      </SheetContent>
    </Sheet>
  );
}
