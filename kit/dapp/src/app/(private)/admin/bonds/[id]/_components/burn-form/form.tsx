'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { type AssetDetailConfig, pluralize } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { BurnBondFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { Targets } from './steps/targets';
import { burnBond } from './store';

export function BurnBondForm({
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
      storeAction={(formData) => burnBond({ ...formData, address, decimals })}
      resolverAction={zodResolver(BurnBondFormSchema)}
      onClose={onCloseAction}
      cacheInvalidation={{
        clientCacheKeys: [assetConfig.queryKey, ['transactions']],
        serverCachePath: () => `/admin/bonds/${address}`,
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
