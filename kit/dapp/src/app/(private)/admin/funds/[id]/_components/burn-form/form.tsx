import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { BurnStablecoinFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recepients';
import { Summary } from './steps/summary';
import { burnStablecoin } from './store';

export function BurnStablecoinForm({
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
      storeAction={burnStablecoin}
      resolverAction={zodResolver(BurnStablecoinFormSchema)}
      onClose={onClose}
      submitLabel="Burn Asset"
    >
      <Recipients />
      <Amount />
      <Summary address={address} />
    </AssetForm>
  );
}
