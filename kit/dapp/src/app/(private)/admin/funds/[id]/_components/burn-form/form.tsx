import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { BurnFundFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { burnFund } from './store';

export function BurnFundForm({
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
      storeAction={burnFund}
      resolverAction={zodResolver(BurnFundFormSchema)}
      onClose={onClose}
      submitLabel="Burn"
    >
      <Amount />
      <Summary address={address} />
    </AssetForm>
  );
}
