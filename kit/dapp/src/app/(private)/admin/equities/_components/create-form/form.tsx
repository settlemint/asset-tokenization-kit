import { AssetForm } from '@/components/blocks/asset-form/asset-form';
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
      title="Create Equity"
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
