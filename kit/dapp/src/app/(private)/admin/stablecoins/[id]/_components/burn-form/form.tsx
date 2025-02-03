import { DASHBOARD_STATS_QUERY_KEY } from '@/app/(private)/admin/(dashboard)/_components/dashboard-stats/consts';
import { ASSETS_SIDEBAR_CACHE_KEY } from '@/app/(private)/admin/_lib/consts';
import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { TokenType } from '@/types/token-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { BurnStablecoinFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recepients';
import { Summary } from './steps/summary';
import { burnStablecoin } from './store';

export function BurnStablecoinForm({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <AssetForm
      revalidateTags={[TokenType.Stablecoin, DASHBOARD_STATS_QUERY_KEY, ASSETS_SIDEBAR_CACHE_KEY]}
      storeAction={burnStablecoin}
      resolverAction={zodResolver(BurnStablecoinFormSchema)}
      onClose={onClose}
      submitLabel="Burn Asset"
    >
      <Recipients />
      <Amount />
      <Summary />
    </AssetForm>
  );
}
