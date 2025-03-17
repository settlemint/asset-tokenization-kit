'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { getAssetDetail } from '@/lib/queries/asset-detail';
import type { AssetType } from '@/lib/utils/zod';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { RedeemForm } from './redeem-form/form';
import { TransferForm } from './transfer-form/form';

interface ManageDropdownProps {
  address: Address;
  assettype: AssetType;
  detail: Awaited<ReturnType<typeof getAssetDetail>>;
}

export function ManageDropdown({
  address,
  assettype,
  detail,
}: ManageDropdownProps) {
  const t = useTranslations('portfolio.my-assets.bond');

  const menuItems = [
    {
      id: 'transfer',
      label: t('transfer-form.trigger-label'),
    },
    ...(assettype === 'bond'
      ? [
          {
            id: 'redeem',
            label: t('redeem-form.trigger-label'),
          },
        ]
      : []),
  ] as const;

  const [openMenuItem, setOpenMenuItem] = useState<
    (typeof menuItems)[number]['id'] | null
  >(null);

  const onFormOpenChange = (open: boolean) => {
    if (!open) {
      setOpenMenuItem(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="bg-accent text-accent-foreground shadow-inset hover:bg-accent-hover"
          >
            {t('transfer-form.trigger-label')}
            <ChevronDown className="ml-2 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded p-0 shadow-dropdown">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => setOpenMenuItem(item.id)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <TransferForm
        address={address}
        assettype={assettype}
        balance={Number(detail.totalSupply)}
        decimals={detail.decimals}
        open={openMenuItem === 'transfer'}
        onOpenChange={onFormOpenChange}
      />
      <RedeemForm
        address={address}
        balance={Number(detail.totalSupply)}
        open={openMenuItem === 'redeem'}
        onOpenChange={onFormOpenChange}
      />
    </>
  );
}
