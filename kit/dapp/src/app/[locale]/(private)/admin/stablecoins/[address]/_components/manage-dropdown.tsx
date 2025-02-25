'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ChevronDown } from 'lucide-react';
import type { Address } from 'viem';
import { BurnForm } from './burn-form/form';
import { GrantRoleForm } from './grant-role-form/form';
import { MintForm } from './mint-form/form';
import { PauseForm } from './pause-form/form';
import { UpdateCollateralForm } from './update-collateral-form/form';

interface ManageDropdownProps {
  address: Address;
}

export function ManageDropdown({ address }: ManageDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          Manage
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="relative right-4 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-0 shadow-dropdown">
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <MintForm address={address} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <BurnForm address={address} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <PauseForm address={address} />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <UpdateCollateralForm address={address} />
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem asChild className="dropdown-menu-item">
          <GrantRoleForm address={address} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
