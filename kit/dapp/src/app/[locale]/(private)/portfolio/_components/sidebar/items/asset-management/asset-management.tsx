'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { type NavItem, NavMain } from '@/components/layout/nav-main';
import { useSidebarAssets } from '@/lib/queries/sidebar-assets/sidebar-assets';
import { assetItems } from './assets';

export function AssetManagement() {
  const data = useSidebarAssets();

  const processedAssetItems = assetItems.reduce((acc, section) => {
    if (!section.assetType) {
      return acc;
    }

    const assetsOfSection = data[section.assetType];
    const subItems = assetsOfSection.records.map<NavItem>((asset) => ({
      id: asset.id,
      label: (
        <>
          {asset.name}{' '}
          <span className="text-muted-foreground text-xs">
            {asset.symbol ?? asset.id}
          </span>
        </>
      ),
      path: `${section.path}/${asset.id}`,
      icon: <AddressAvatar address={asset.id} size="tiny" />,
    }));

    // Create a predictable object structure to ensure consistent rendering between server and client
    const sectionItem: NavItem = {
      ...section,
      label: section.label,
      path: section.path,
      badge: assetsOfSection.count.toString(),
    };

    // Only add subItems if there are any to prevent different rendering conditions
    if (subItems.length > 0) {
      sectionItem.subItems = [...subItems];

      // Add the "View all" item only if there are assets
      if (assetsOfSection.count > 0) {
        sectionItem.subItems.push({
          id: 'view-all',
          label: 'View all',
          path: section.path,
          icon: <span>→</span>,
          badge: assetsOfSection.count.toString(),
        });
      }
    }

    acc.push(sectionItem);
    return acc;
  }, [] as NavItem[]);

  return (
    <NavMain
      items={[
        {
          groupTitle: 'Asset management',
          items: processedAssetItems,
        },
      ]}
    />
  );
}
