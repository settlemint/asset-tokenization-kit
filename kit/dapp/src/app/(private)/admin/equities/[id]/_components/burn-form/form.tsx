'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { type AssetDetailConfig, pluralize } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { BurnEquityFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { Targets } from './steps/targets';
import { burnEquity } from './store';

export function BurnEquityForm({
  address,
  decimals,
  assetConfig,
  onCloseAction,
}: {
  address: Address;
  decimals: number;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}) {
  return (
    <AssetForm
      storeAction={(formData) => burnEquity({ ...formData, address, decimals })}
      resolverAction={zodResolver(BurnEquityFormSchema)}
      onClose={onCloseAction}
      cacheInvalidation={{
        clientCacheKeys: [assetConfig.queryKey, ['transactions']],
        serverCachePath: () => `/admin/equities/${address}`,
      }}
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
      <Summary />
    </AssetForm>
  );
}
