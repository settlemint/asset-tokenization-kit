import type { NavItem } from '@/components/layout/nav-main';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { assetConfig } from '@/lib/config/assets';

export const assetItems: NavItem[] = [
  {
    assetType: 'bond',
    label: assetConfig.bond.pluralName,
    path: `/admin/${assetConfig.bond.urlSegment}`,
    icon: (
      <Avatar className="h-5 w-5 border border-foreground-muted">
        <AvatarFallback className="text-[7px]">BN</AvatarFallback>
      </Avatar>
    ),
  },
  {
    assetType: 'cryptocurrency',
    label: assetConfig.cryptocurrency.pluralName,
    path: `/admin/${assetConfig.cryptocurrency.urlSegment}`,
    icon: (
      <Avatar className="h-5 w-5 border border-foreground-muted">
        <AvatarFallback className="text-[7px]">CC</AvatarFallback>
      </Avatar>
    ),
  },
  {
    assetType: 'equity',
    label: assetConfig.equity.pluralName,
    path: `/admin/${assetConfig.equity.urlSegment}`,
    icon: (
      <Avatar className="h-5 w-5 border border-foreground-muted">
        <AvatarFallback className="text-[7px]">EQ</AvatarFallback>
      </Avatar>
    ),
  },
  {
    assetType: 'fund',
    label: assetConfig.fund.pluralName,
    path: `/admin/${assetConfig.fund.urlSegment}`,
    icon: (
      <Avatar className="h-5 w-5 border border-foreground-muted">
        <AvatarFallback className="text-[7px]">FN</AvatarFallback>
      </Avatar>
    ),
  },
  {
    assetType: 'stablecoin',
    label: assetConfig.stablecoin.pluralName,
    path: `/admin/${assetConfig.stablecoin.urlSegment}`,
    icon: (
      <Avatar className="h-5 w-5 border border-foreground-muted">
        <AvatarFallback className="text-[7px]">SC</AvatarFallback>
      </Avatar>
    ),
  },
];
