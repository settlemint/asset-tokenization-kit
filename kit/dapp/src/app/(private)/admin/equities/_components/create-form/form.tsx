import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { assetConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
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
      invalidate={[assetConfig.equity.queryKey, ['transactions']]}
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
