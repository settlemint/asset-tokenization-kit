'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatAssetType } from '@/lib/utils/format-asset-type';
import { useState } from 'react';
import type { Address } from 'viem';
import { TransferForm } from './form';
import type { TransferFormAssetType } from './schema';

export function TransferButton({
  address,
  name,
  symbol,
  type,
  balance,
  decimals,
}: {
  name: string;
  symbol: string;
  address: Address;
  type: TransferFormAssetType;
  balance: string;
  decimals: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          Transfer
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Transfer {formatAssetType(type)} {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            Easily transfer an amount of {formatAssetType(type)} {name} ({symbol}) by selecting a recipient and
            specifying the amount.
          </SheetDescription>
        </SheetHeader>
        <TransferForm
          address={address}
          name={name}
          symbol={symbol}
          assetType={type}
          balance={balance}
          decimals={decimals}
          onClose={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
