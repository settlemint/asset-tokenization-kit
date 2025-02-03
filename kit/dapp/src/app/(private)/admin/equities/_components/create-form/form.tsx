import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { TokenType } from '@/types/token-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { DASHBOARD_STATS_QUERY_KEY } from '../../../(dashboard)/_components/dashboard-stats/consts';
import { CreateEquityFormSchema } from './schema';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';
import { createEquity } from './store';

export function CreateEquityForm({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <AssetForm
      revalidateTags={[TokenType.Equity, DASHBOARD_STATS_QUERY_KEY]}
      storeAction={createEquity}
      resolverAction={zodResolver(CreateEquityFormSchema)}
      onClose={onClose}
    >
      <Basics />
      <Configuration />
      <Summary />
    </AssetForm>
  );
}
