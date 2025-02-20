import { AssetTypeIcon } from '@/components/blocks/asset-type-icon/asset-type-icon';
import type { NavItem } from '@/components/layout/nav-main';
import { assetConfig } from '@/lib/config/assets';

export const assetItems: NavItem[] = [
  {
    assetType: 'bond',
    label: assetConfig.bond.pluralName,
    path: `/admin/${assetConfig.bond.urlSegment}`,
    icon: <AssetTypeIcon type="bond" />,
  },
  {
    assetType: 'cryptocurrency',
    label: assetConfig.cryptocurrency.pluralName,
    path: `/admin/${assetConfig.cryptocurrency.urlSegment}`,
    icon: <AssetTypeIcon type="cryptocurrency" />,
  },
  {
    assetType: 'equity',
    label: assetConfig.equity.pluralName,
    path: `/admin/${assetConfig.equity.urlSegment}`,
    icon: <AssetTypeIcon type="equity" />,
  },
  {
    assetType: 'fund',
    label: assetConfig.fund.pluralName,
    path: `/admin/${assetConfig.fund.urlSegment}`,
    icon: <AssetTypeIcon type="fund" />,
  },
  {
    assetType: 'stablecoin',
    label: assetConfig.stablecoin.pluralName,
    path: `/admin/${assetConfig.stablecoin.urlSegment}`,
    icon: <AssetTypeIcon type="stablecoin" />,
  },
];
