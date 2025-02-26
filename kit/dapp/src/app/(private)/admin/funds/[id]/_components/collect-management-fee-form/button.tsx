'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { type JSX, useState } from 'react';
import type { Address } from 'viem';
import { CollectManagementFeeForm } from './form';

interface CollectManagementFeeButtonProps {
  address: Address;
  name: string;
  symbol: string;
}

export function CollectManagementFeeButton({ address, name, symbol }: CollectManagementFeeButtonProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="dropdown-menu-item w-full justify-start">
          Collect management fee
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Collect Management Fee for {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            Collect the accumulated management fee for your {name} ({symbol}) fund.
          </SheetDescription>
        </SheetHeader>
        <CollectManagementFeeForm
          address={address}
          name={name}
          symbol={symbol}
          assetConfig={assetConfig.fund}
          onCloseAction={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
