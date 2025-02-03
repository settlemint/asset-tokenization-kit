import { DASHBOARD_STATS_QUERY_KEY } from '@/app/(private)/admin/(dashboard)/_components/dashboard-stats/consts';
import { ASSETS_SIDEBAR_CACHE_KEY } from '@/app/(private)/admin/_lib/consts';
import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { TokenType } from '@/types/token-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { MintStablecoinFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recepients';
import { Summary } from './steps/summary';
import { mintStablecoin } from './store';

export function MintStablecoinForm({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <AssetForm
      revalidateTags={[TokenType.Stablecoin, DASHBOARD_STATS_QUERY_KEY, ASSETS_SIDEBAR_CACHE_KEY]}
      storeAction={mintStablecoin}
      resolverAction={zodResolver(MintStablecoinFormSchema)}
      onClose={onClose}
      submitLabel="Mint Asset"
    >
      <Recipients />
      <Amount />
      <Summary />
    </AssetForm>
  );
}
