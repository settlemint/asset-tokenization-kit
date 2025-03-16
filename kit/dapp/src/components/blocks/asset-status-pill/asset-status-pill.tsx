import type { AssetBalance } from '@/lib/queries/asset-balance/asset-balance-fragment';
import { XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactElement } from 'react';
import { ActivePill } from '../active-pill/active-pill';

type AssetStatusPillProps = {
  assetBalance: AssetBalance;
  asString?: boolean;
};

export function AssetStatusPill({
  assetBalance,
}: AssetStatusPillProps): ReactElement {
  const t = useTranslations('components.asset-status-pill');

  if (assetBalance.blocked) {
    return (
      <>
        <XCircle className="size-4 text-muted-foreground" />
        <span>{t('blocked')}</span>
      </>
    );
  }

  return <ActivePill paused={assetBalance.asset.paused} />;
}
