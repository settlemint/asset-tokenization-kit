'use client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { BlockUserForm } from './form';

interface BlockButtonProps {
  address: Address;
  currentlyBlocked: boolean;
  userAddress: Address;
  assetConfig: AssetDetailConfig;
}

export function BlockButton({ address, currentlyBlocked, userAddress, assetConfig }: BlockButtonProps) {
  const [open, setOpen] = useState(false);
  const action = currentlyBlocked ? 'Unblock' : 'Block';

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
            {action} to {currentlyBlocked ? 'enable' : 'prevent'} transfers.
          </SheetDescription>
        </SheetHeader>
        <BlockUserForm
          address={address}
          userAddress={userAddress}
          currentlyBlocked={currentlyBlocked}
          assetConfig={assetConfig}
          onCloseAction={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
