'use client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import type { Address } from 'viem';
import { BlockHolderForm } from './form';

interface BlockHolderButtonProps {
  address: Address;
  holder: Address;
  blocked: boolean;
}

export function BlockHolderButton({ address, holder, blocked }: BlockHolderButtonProps) {
  const [open, setOpen] = useState(false);
  const action = blocked ? 'Unblock' : 'Block';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="w-full text-left text-sm"
          onClick={(e) => {
            e.stopPropagation();
          }}
          data-ui-unstyled
        >
          {action} holder
        </button>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>{action} Holder</SheetTitle>
          <SheetDescription>
            {action} this holder to {blocked ? 'enable' : 'prevent'} token transfers.
          </SheetDescription>
        </SheetHeader>
        <BlockHolderForm address={address} holder={holder} blocked={blocked} onCloseAction={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
