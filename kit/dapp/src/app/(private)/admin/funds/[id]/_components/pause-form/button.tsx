'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { PauseFundForm } from './form';

interface PauseTokensButtonProps {
  address: Address;
  name: string;
  symbol: string;
  paused: boolean;
}

export function PauseTokensButton({ address, name, symbol, paused }: PauseTokensButtonProps) {
  console.log('PauseTokensButton rendered with paused:', paused);
  const [open, setOpen] = useState(false);
  const action = paused ? 'Unpause' : 'Pause';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          {action} {assetConfig.fund.name.toLowerCase()}
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>
            {action} {name} ({symbol})
          </SheetTitle>
          <SheetDescription>
            {action} your {name} ({symbol}) tokens to {paused ? 'enable' : 'prevent'} transfers.
          </SheetDescription>
        </SheetHeader>
        <PauseFundForm
          address={address}
          paused={paused}
          assetConfig={assetConfig.fund}
          onClose={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
