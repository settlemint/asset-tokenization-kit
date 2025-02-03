import { DASHBOARD_STATS_QUERY_KEY } from '@/app/(private)/admin/(dashboard)/_components/dashboard-stats/consts';
import { ASSETS_SIDEBAR_CACHE_KEY } from '@/app/(private)/admin/_lib/consts';
import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { TokenType } from '@/types/token-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateFundFormSchema } from './schema';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';
import { createFund } from './store';

export function CreateFundForm({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <AssetForm
      revalidateTags={[TokenType.Fund, DASHBOARD_STATS_QUERY_KEY, ASSETS_SIDEBAR_CACHE_KEY]}
      storeAction={createFund}
      resolverAction={zodResolver(CreateFundFormSchema)}
      onClose={onClose}
    >
      <Basics />
      <Configuration />
      <Summary />
    </AssetForm>
  );
}
