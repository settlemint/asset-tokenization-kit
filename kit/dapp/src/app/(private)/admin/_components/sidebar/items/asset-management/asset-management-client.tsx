'use client';
import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { type NavItem, NavMain } from '@/components/layout/nav-main';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { assetItems } from './assets';
import { getSidebarAssets } from './data';

type AssetManagementClientProps = {
  queryKey: QueryKey;
};

export function AssetManagementClient({ queryKey }: AssetManagementClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getSidebarAssets,
    refetchInterval: 60 * 1000,
  });

  const processedTokenItems = assetItems.reduce((acc, section) => {
    if (!section.assetType) {
      return acc;
    }

    const assetsOfSection = data[section.assetType];
    const subItems = assetsOfSection.records.map<NavItem>((asset) => ({
      id: asset.id,
      label: `${asset.name} (${asset.symbol ?? asset.id})`,
      path: `${section.path}/${asset.id}`,
      icon: <AddressAvatar address={asset.id as Address} variant="tiny" />,
    }));
    if (assetsOfSection.count > 0) {
      subItems.push({
        id: 'view-all',
        label: 'View all',
        path: section.path,
        icon: <span>→</span>,
        badge: assetsOfSection.count.toString(),
      });
    }

    acc.push({
      ...section,
      label: section.label,
      path: section.path,
      badge: assetsOfSection.count.toString(),
      subItems,
    });

    return acc;
  }, [] as NavItem[]);

  return (
    <NavMain
      items={[
        {
          groupTitle: 'Asset management',
          items: processedTokenItems,
        },
      ]}
    />
  );
}
