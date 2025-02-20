'use client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { AssetDetailConfig } from '@/lib/config/assets';
import type { Role } from '@/lib/config/roles';
import { useState } from 'react';
import type { Address } from 'viem';
import { EditRolesForm } from './form';

interface EditButtonProps {
  address: Address;
  currentRoles: Role[];
  userAddress: Address;
  assetConfig: AssetDetailConfig;
}

export function EditButton({ address, currentRoles, userAddress, assetConfig }: EditButtonProps) {
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
          Edit
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent className="min-w-[34rem]">
        <SheetHeader>
          <SheetTitle>Edit roles</SheetTitle>
          <SheetDescription>Manage which actions users are permitted to perform on the asset.</SheetDescription>
        </SheetHeader>
        <EditRolesForm
          address={address}
          userAddress={userAddress}
          currentRoles={currentRoles}
          assetConfig={assetConfig}
          onCloseAction={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
