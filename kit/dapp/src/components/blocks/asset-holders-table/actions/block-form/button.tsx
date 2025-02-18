'use client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { assetConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { BlockUserForm } from './form';

interface BlockButtonProps {
  address: Address;
  blocked: boolean;
  userAddress: Address;
}

export function BlockButton({ address, blocked, userAddress }: BlockButtonProps) {
  const [open, setOpen] = useState(false);
  const action = blocked ? 'Unblock' : 'Block';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          {action}
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>{action}</SheetTitle>
          <SheetDescription>
            {action} to {blocked ? 'enable' : 'prevent'} transfers.
          </SheetDescription>
        </SheetHeader>
        <BlockUserForm
          address={address}
          userAddress={userAddress}
          blocked={blocked}
          assetConfig={assetConfig.stablecoin}
          onCloseAction={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
