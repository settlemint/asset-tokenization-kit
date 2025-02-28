import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { AssetTypeIcon } from '@/components/blocks/asset-type-icon/asset-type-icon';
import { type NavItem, NavMain } from '@/components/layout/nav-main';
import { getSidebarAssets } from '@/lib/queries/sidebar-assets/sidebar-assets';
import { getTranslations } from 'next-intl/server';

export async function AssetManagement() {
  const t = await getTranslations('admin.sidebar.asset-management');
  const data = await getSidebarAssets();

  // Asset configuration defined inline
  const assetItems: NavItem[] = [
    {
      assetType: 'bond',
      label: t('bonds'),
      path: `/admin/bonds`,
      icon: <AssetTypeIcon type="bond" />,
    },
    {
      assetType: 'cryptocurrency',
      label: t('cryptocurrencies'),
      path: `/admin/cryptocurrencies`,
      icon: <AssetTypeIcon type="cryptocurrency" />,
    },
    {
      assetType: 'equity',
      label: t('equities'),
      path: `/admin/equities`,
      icon: <AssetTypeIcon type="equity" />,
    },
    {
      assetType: 'fund',
      label: t('funds'),
      path: `/admin/funds`,
      icon: <AssetTypeIcon type="fund" />,
    },
    {
      assetType: 'stablecoin',
      label: t('stablecoins'),
      path: `/admin/stablecoins`,
      icon: <AssetTypeIcon type="stablecoin" />,
    },
  ];

  const processedAssetItems = assetItems.reduce((acc, section) => {
    if (!section.assetType) {
      return acc;
    }

    const assetType = section.assetType;
    const assetsOfSection = data[assetType];

    const subItems = assetsOfSection.records.map((asset) => ({
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
          label: t('view-all'),
          path: section.path,
          icon: <span>→</span>,
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
          groupTitle: t('group-title'),
          items: processedAssetItems,
        },
      ]}
    />
  );
}
