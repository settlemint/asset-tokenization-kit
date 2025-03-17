'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { bondGrantRoleAction } from '@/lib/mutations/asset/access-control/grant-role/grant-role-action';
import type { getAssetDetail } from '@/lib/queries/asset-detail';
import type { getBondDetail } from '@/lib/queries/bond/bond-detail';
import type { AssetType } from '@/lib/utils/zod';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { BurnForm } from './burn-form/form';
import { GrantRoleForm } from './grant-role-form/form';
import { MatureForm } from './mature-form/form';
import { MintForm } from './mint-form/form';
import { PauseForm } from './pause-form/form';
import { TopUpForm } from './top-up-form/form';
import { UpdateCollateralForm } from './update-collateral-form/form';
import { WithdrawForm } from './withdraw-form/form';

interface ManageDropdownProps {
  address: Address;
  assettype: AssetType;
  detail: Awaited<ReturnType<typeof getAssetDetail>>;
}

export function ManageDropdown({
  address,
  detail,
  assettype,
}: ManageDropdownProps) {
  const t = useTranslations('private.assets.detail.forms');
  const [openMenuItem, setOpenMenuItem] = useState<
    (typeof menuItems)[number]['id'] | null
  >(null);

  const onFormOpenChange = (open: boolean) => {
    if (!open) {
      setOpenMenuItem(null);
    }
  };

  let cannotMature = true;
  let hasUnderlyingAsset = false;
  if (assettype === 'bond') {
    const bond = detail as Awaited<ReturnType<typeof getBondDetail>>;
    hasUnderlyingAsset = true;
    cannotMature =
      bond.isMatured ||
      !bond.hasSufficientUnderlying ||
      (bond.maturityDate
        ? new Date(Number(bond.maturityDate) * 1000) < new Date()
        : false);
  }

  const menuItems = [
    {
      id: 'mint',
      label: t('actions.mint'),
      disabled: false,
      form: (
        <MintForm
          key="mint"
          address={address}
          assettype={assettype}
          open={openMenuItem === 'mint'}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: 'burn',
      label: t('actions.burn'),
      disabled: false,
      form: (
        <BurnForm
          key="burn"
          address={address}
          assettype={assettype}
          balance={Number(detail.totalSupply)}
          open={openMenuItem === 'burn'}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: 'pause',
      label:
        'paused' in detail && detail.paused
          ? t('actions.unpause')
          : t('actions.pause'),
      disabled: !('paused' in detail),
      form: (
        <PauseForm
          key="pause"
          address={address}
          assettype={assettype}
          isPaused={'paused' in detail && detail.paused}
          open={openMenuItem === 'pause'}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: 'grant-role',
      label: t('actions.grant-role'),
      disabled: false,
      form: (
        <GrantRoleForm
          key="grant-role"
          address={address}
          open={openMenuItem === 'grant-role'}
          onOpenChange={onFormOpenChange}
          grantRoleAction={bondGrantRoleAction}
        />
      ),
    },
    {
      id: 'top-up',
      label: t('actions.top-up'),
      disabled: hasUnderlyingAsset,
      form: (
        <TopUpForm
          key="top-up"
          address={address}
          underlyingAssetAddress={
            'underlyingAsset' in detail ? detail.underlyingAsset : '0x0'
          }
          open={openMenuItem === 'top-up'}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: 'withdraw',
      label: t('actions.withdraw'),
      disabled: hasUnderlyingAsset,
      form: (
        <WithdrawForm
          key="withdraw"
          address={address}
          underlyingAssetAddress={
            'underlyingAsset' in detail ? detail.underlyingAsset : '0x0'
          }
          open={openMenuItem === 'withdraw'}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: 'mature',
      label: t('actions.mature'),
      disabled: cannotMature,
      form: (
        <MatureForm
          key="mature"
          address={address}
          open={openMenuItem === 'mature'}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
    {
      id: 'update-collateral',
      label: t('actions.update-collateral'),
      disabled: assettype !== 'stablecoin',
      form: (
        <UpdateCollateralForm
          key="update-collateral"
          address={address}
          open={openMenuItem === 'update-collateral'}
          onOpenChange={onFormOpenChange}
        />
      ),
    },
  ] as const;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="bg-accent text-accent-foreground shadow-inset hover:bg-accent-hover"
          >
            {t('manage')}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded p-0 shadow-dropdown">
          {menuItems
            .filter((item) => !item.disabled)
            .map((item) => (
              <DropdownMenuItem
                key={item.id}
                onSelect={() => setOpenMenuItem(item.id)}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {menuItems.filter((item) => !item.disabled).map((item) => item.form)}
    </>
  );
}
