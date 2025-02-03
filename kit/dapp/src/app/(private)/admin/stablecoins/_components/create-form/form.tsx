import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { TokenType } from '@/types/token-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { DASHBOARD_STATS_QUERY_KEY } from '../../../(dashboard)/_components/dashboard-stats/consts';
import { CreateStablecoinFormSchema } from './schema';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';
import { createStablecoin } from './store';

export function CreateStablecoinForm({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <AssetForm
      revalidateTags={[TokenType.Stablecoin, DASHBOARD_STATS_QUERY_KEY]}
      storeAction={createStablecoin}
      resolverAction={zodResolver(CreateStablecoinFormSchema)}
      onClose={onClose}
    >
      <Basics />
      <Configuration />
      <Summary />
    </AssetForm>
  );
}
