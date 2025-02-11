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
      submitLabel="Create"
      submittingLabel="Creating..."
      messages={{
        onCreate: (data) => `Creating ${data.assetName} (${data.symbol})`,
        onSuccess: (data) => `${data.assetName} (${data.symbol}) created successfully on chain`,
        onError: (data, error: Error) => `Creation of ${data.assetName} (${data.symbol}) failed: ${error.message}`,
      }}
    >
      <Basics />
      <Configuration />
      <Summary />
    </AssetForm>
  );
}
