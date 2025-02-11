'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { type AssetDetailConfig, pluralize } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { BurnFundFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { Targets } from './steps/targets';
import { burnFund } from './store';

export function BurnFundForm({
  address,
  decimals,
  assetConfig,
  onClose,
}: {
  address: Address;
  decimals: number;
  assetConfig: AssetDetailConfig;
  onClose: () => void;
}) {
  return (
    <AssetForm
      invalidate={[assetConfig.queryKey, ['transactions']]}
      storeAction={(formData) => burnFund({ ...formData, address, decimals })}
      resolverAction={zodResolver(BurnFundFormSchema)}
      onClose={onClose}
      submitLabel="Burn"
      submittingLabel="Burning..."
      messages={{
        onCreate: (data) => `Burning ${data.amount} ${pluralize(data.amount, assetConfig)}...`,
        onSuccess: (data) => `Successfully burned ${data.amount} ${pluralize(data.amount, assetConfig)} on chain`,
        onError: (data, error) =>
          `Failed to burn ${data?.amount ?? ''} ${pluralize(data?.amount ?? 0, assetConfig)}: ${error.message}`,
      }}
    >
      <Targets />
      <Amount />
      <Summary address={address} />
    </AssetForm>
  );
}
