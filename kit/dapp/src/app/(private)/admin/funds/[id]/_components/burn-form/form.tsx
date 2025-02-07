import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { pluralize } from '@/lib/utils';
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
      storeAction={(formData) => burnFund({ ...formData, address })}
      resolverAction={zodResolver(BurnFundFormSchema)}
      onClose={onClose}
      submitLabel="Burn"
      messages={{
        onCreate: (data) => `Burning ${data.amount} ${pluralize(data.amount, 'token')}...`,
        onSuccess: (data) => `Successfully burned ${data.amount} ${pluralize(data.amount, 'token')} on chain`,
        onError: (data, error) =>
          `Failed to burn ${data?.amount ?? ''} ${pluralize(data?.amount ?? 0, 'token')}: ${error.message}`,
      }}
    >
      <Amount />
      <Summary address={address} />
    </AssetForm>
  );
}
