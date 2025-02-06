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
  assetConfig,
  onClose,
}: {
  address: Address;
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
    >
      <Amount />
      <Summary address={address} />
    </AssetForm>
  );
}
