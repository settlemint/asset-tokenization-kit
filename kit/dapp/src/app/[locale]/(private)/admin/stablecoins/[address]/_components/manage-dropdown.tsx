import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { getStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { ChevronDown } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import { BurnForm } from './burn-form/form';
import { GrantRoleForm } from './grant-role-form/form';
import { MintForm } from './mint-form/form';
import { PauseForm } from './pause-form/form';
import { UpdateCollateralForm } from './update-collateral-form/form';

interface ManageDropdownProps {
  address: Address;
}

export async function ManageDropdown({ address }: ManageDropdownProps) {
  const t = await getTranslations('admin.stablecoins.manage');
  const stableCoin = await getStableCoinDetail({ address });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          {t('manage')}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded shadow-dropdown">
        <DropdownMenuItem>
          <MintForm
            address={address}
            collateralAvailable={Number(stableCoin.collateral)}
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <BurnForm
            address={address}
            balance={Number(stableCoin.totalSupply)}
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <PauseForm address={address} isPaused={stableCoin.paused} />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <UpdateCollateralForm address={address} />
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem>
          <GrantRoleForm address={address} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
