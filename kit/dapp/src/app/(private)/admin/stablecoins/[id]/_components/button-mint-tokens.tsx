'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { MintStablecoinForm } from './mint-form/form';

export function MintTokensButton({ assetName = 'asset' }: { assetName: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          Mint tokens
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>Mint {assetName}</SheetTitle>
          <SheetDescription>
            Easily mint your {assetName} tokens by selecting a recipient and specifying the amount.
          </SheetDescription>
        </SheetHeader>
        <MintStablecoinForm onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
