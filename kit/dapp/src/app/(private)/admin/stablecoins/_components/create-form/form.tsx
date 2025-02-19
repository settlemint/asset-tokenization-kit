import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { assetConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateStablecoinFormSchema } from './schema';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';
import { createStablecoin } from './store';

export function CreateStablecoinForm({
  onCloseAction,
}: {
  onCloseAction: () => void;
}) {
  return (
    <AssetForm
      storeAction={createStablecoin}
      resolverAction={zodResolver(CreateStablecoinFormSchema)}
      onClose={onCloseAction}
      assetConfig={assetConfig.stablecoin}
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
