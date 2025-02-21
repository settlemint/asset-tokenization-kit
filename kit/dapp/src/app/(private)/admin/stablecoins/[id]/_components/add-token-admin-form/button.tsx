'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { AddTokenAdminForm } from './form';

export function AddTokenAdminButton({
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
          Add token admin
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            Add Token Admin for {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            Add a new admin for {name} ({symbol}) by specifying their wallet address.
          </SheetDescription>
        </SheetHeader>
        <AddTokenAdminForm
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
