import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { TokenType } from '@/types/token-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { DASHBOARD_STATS_QUERY_KEY } from '../../../(dashboard)/_components/dashboard-stats/consts';
import { ASSETS_SIDEBAR_CACHE_KEY } from '../../../_lib/consts';
import { CreateCryptoCurrencyFormSchema } from './schema';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';
import { createCryptocurrency } from './store';

export function CreateCryptocurrencyForm({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <AssetForm
      storeAction={createCryptocurrency}
      resolverAction={zodResolver(CreateCryptoCurrencyFormSchema)}
      onClose={onClose}
      revalidateTags={[TokenType.Cryptocurrency, DASHBOARD_STATS_QUERY_KEY, ASSETS_SIDEBAR_CACHE_KEY]}
    >
      <Basics />
      <Configuration />
      <Summary />
    </AssetForm>
  );
}
