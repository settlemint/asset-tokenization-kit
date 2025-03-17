'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { AssetType } from '@/lib/utils/zod';
import { useTranslations } from 'next-intl';
import { getAssetColor } from './asset-color';

interface AssetTypeIconProps {
  type: AssetType;
  size?: 'sm' | 'md';
}

export function AssetTypeIcon({ type, size = 'sm' }: AssetTypeIconProps) {
  const t = useTranslations('components.asset-type-icon');
  const sizeClass = size === 'sm' ? 'size-4' : 'size-6';

  function getAssetInitials(
    type:
      | 'bond'
      | 'cryptocurrency'
      | 'equity'
      | 'fund'
      | 'stablecoin'
      | 'tokenizeddeposit'
  ): string {
    switch (type) {
      case 'bond':
        return t('bond-initials');
      case 'cryptocurrency':
        return t('cryptocurrency-initials');
      case 'equity':
        return t('equity-initials');
      case 'fund':
        return t('fund-initials');
      case 'stablecoin':
        return t('stablecoin-initials');
      case 'tokenizeddeposit':
        return t('tokenized-deposit-initials');
      default:
        return t('not-available-initials');
    }
  }

  return (
    <Avatar className={`${sizeClass} border border-foreground-muted`}>
      <AvatarFallback
        className={cn(
          'font-bold text-[7px] text-foreground dark:text-sm-dark-gray',
          getAssetColor(type)
        )}
      >
        {getAssetInitials(type)}
      </AvatarFallback>
    </Avatar>
  );
}
