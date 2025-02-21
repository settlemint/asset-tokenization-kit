'use client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { AssetDetailConfig } from '@/lib/config/assets';
import type { Role } from '@/lib/config/roles';
import { useState } from 'react';
import type { Address } from 'viem';
import { RevokeAllForm } from './form';

interface RevokeAllButtonProps {
  address: Address;
  userAddress: Address;
  assetConfig: AssetDetailConfig;
  currentRoles: Role[];
}

export function RevokeAllButton({ address, userAddress, assetConfig, currentRoles }: RevokeAllButtonProps) {
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
          Revoke All
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>Revoke All Permissions</SheetTitle>
          <SheetDescription>Remove all permissions for this user on the asset.</SheetDescription>
        </SheetHeader>
        <RevokeAllForm
          address={address}
          userAddress={userAddress}
          assetConfig={assetConfig}
          currentRoles={currentRoles}
          onCloseAction={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
