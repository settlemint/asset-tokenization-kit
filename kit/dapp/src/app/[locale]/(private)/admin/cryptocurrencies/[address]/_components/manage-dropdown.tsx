import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ChevronDown } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import { GrantRoleForm } from './grant-role-form/form';
import { MintForm } from './mint-form/form';

interface ManageDropdownProps {
  address: Address;
}

export async function ManageDropdown({ address }: ManageDropdownProps) {
  const t = await getTranslations('admin.cryptocurrencies.manage');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          {t('manage')}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded p-0 shadow-dropdown">
        <DropdownMenuItem>
          <MintForm address={address} />
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem>
          <GrantRoleForm address={address} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
