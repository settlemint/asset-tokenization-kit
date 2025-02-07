import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { assetConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
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
      invalidate={[assetConfig.cryptocurrency.queryKey, ['transactions']]}
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
