'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { PauseStablecoinForm } from './form';

interface PauseButtonProps {
  address: Address;
  name: string;
  symbol: string;
  paused: boolean;
}

export function PauseButton({ address, name, symbol, paused }: PauseButtonProps) {
  const [open, setOpen] = useState(false);
  const action = paused ? 'Unpause' : 'Pause';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          {action} {assetConfig.stablecoin.name.toLowerCase()}
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
        <PauseStablecoinForm
          address={address}
          paused={paused}
          assetConfig={assetConfig.stablecoin}
          onCloseAction={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
