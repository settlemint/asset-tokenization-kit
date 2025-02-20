'use client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { FreezeForm } from './form';

interface FreezeButtonProps {
  address: Address;
  decimals: number;
  userAddress: Address;
  currentFrozen: number;
  currentBalance: number;
  assetConfig: AssetDetailConfig;
}

export function FreezeButton({
  address,
  decimals,
  currentFrozen,
  currentBalance,
  userAddress,
  assetConfig,
}: FreezeButtonProps) {
  const [open, setOpen] = useState(false);

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
          Freeze
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>Freeze</SheetTitle>
          <SheetDescription>Freeze an amount of assets.</SheetDescription>
        </SheetHeader>
        <FreezeForm
          address={address}
          decimals={decimals}
          userAddress={userAddress}
          currentlyFrozen={currentFrozen}
          currentBalance={currentBalance}
          assetConfig={assetConfig}
          onCloseAction={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
