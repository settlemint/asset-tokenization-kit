'use client';
import type { PermissionRole } from '@/components/blocks/asset-permissions-table/asset-permissions-table-data';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useState } from 'react';
import type { Address } from 'viem';
import { EditRolesForm } from './form';

interface EditButtonProps {
  address: Address;
  currentRoles: PermissionRole[];
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
          <SheetDescription>Edit roles for {assetConfig.name}.</SheetDescription>
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
