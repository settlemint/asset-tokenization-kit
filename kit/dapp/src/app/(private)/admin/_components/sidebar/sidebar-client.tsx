'use client';
import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { NavFooter } from '@/components/layout/nav-footer';
import { NavHeader } from '@/components/layout/nav-header';
import { type NavItem, NavMain } from '@/components/layout/nav-main';
import { TokenDesignerButton } from '@/components/layout/token-designer-button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getSidebarAssets } from './data';
import { bottomItems, tokenItems, topItems } from './items';

type SidebarClientProps = {
  queryKey: QueryKey;
};

export function SidebarClient({ queryKey }: SidebarClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getSidebarAssets,
    refetchInterval: 60 * 1000,
  });

  const processedTokenItems = tokenItems.reduce((acc, section) => {
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
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-0">
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent className="mx-4 pt-0">
        <TokenDesignerButton />
        <NavMain items={topItems} />
        <NavMain
          items={[
            {
              groupTitle: 'Token management',
              items: processedTokenItems,
            },
          ]}
        />
        <NavMain items={bottomItems} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavFooter mode="admin" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
