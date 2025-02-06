import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { UpdateCollateralFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { updateCollateral } from './store';

export function UpdateCollateralStablecoinForm({
  address,
  name,
  symbol,
  assetConfig,
  onClose,
}: {
  address: Address;
  name: string;
  symbol: string;
  assetConfig: AssetDetailConfig;
  onClose: () => void;
}) {
  return (
    <AssetForm
      invalidate={[assetConfig.queryKey, ['transactions']]}
      storeAction={updateCollateral}
      resolverAction={zodResolver(UpdateCollateralFormSchema)}
      onClose={onClose}
      submitLabel="Update collateral"
      messages={{
        onCreate: () => `Updating collateral for ${name} (${symbol})`,
        onSuccess: () => `${name} (${symbol}) collateral updated successfully on chain`,
        onError: (_input, error) => `Failed to update collateral ${name} (${symbol}) failed: ${error.message}`,
      }}
    >
      <Amount />
      <Summary address={address} />
    </AssetForm>
  );
}
