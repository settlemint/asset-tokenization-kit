'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { BurnStablecoinForm } from './burn-form/form';

export function BurnTokensButton({ assetName = 'asset' }: { assetName: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          Burn tokens
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>Burn {assetName}</SheetTitle>
          <SheetDescription>
            Easily burn your {assetName} tokens by selecting a recipient and specifying the amount.
          </SheetDescription>
        </SheetHeader>
        <BurnStablecoinForm onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
