'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { assetConfig } from '@/lib/config/assets';
import { useTranslations } from 'next-intl';

interface AssetTypeIconProps {
  type: keyof typeof assetConfig;
  size?: 'sm' | 'md';
}

export function AssetTypeIcon({ type, size = 'sm' }: AssetTypeIconProps) {
  const t = useTranslations('components.asset-type-icon');
  const sizeClass = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';

  function getAssetInitials(type: keyof typeof assetConfig): string {
    switch (type) {
      // case "bond":
      //   return "BN";
      // case "cryptocurrency":
      //   return "CC";
      // case "equity":
      //   return "EQ";
      // case "fund":
      //   return "FN";
      case 'stablecoin':
        return t('stablecoin-initials');
      default:
        return t('not-available-initials');
    }
  }

  return (
    <Avatar className={`${sizeClass} border border-foreground-muted`}>
      <AvatarFallback className="text-[7px]">
        {getAssetInitials(type)}
      </AvatarFallback>
    </Avatar>
  );
}
