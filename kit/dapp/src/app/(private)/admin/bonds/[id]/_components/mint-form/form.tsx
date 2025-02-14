'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { type AssetDetailConfig, pluralize } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { MintBondFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recipients';
import { Summary } from './steps/summary';
import { mintBond } from './store';

export function MintBondForm({
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
      storeAction={(formData) => mintBond({ ...formData, address, decimals })}
      resolverAction={zodResolver(MintBondFormSchema)}
      onClose={onCloseAction}
      cacheInvalidation={{
        clientCacheKeys: [assetConfig.queryKey, ['transactions']],
        serverCachePath: () => `/admin/bonds/${address}`,
      }}
      submitLabel="Mint"
      submittingLabel="Minting..."
      messages={{
        onCreate: (data) => `Minting ${data.amount} ${pluralize(data.amount, assetConfig)}...`,
        onSuccess: (data) => `Successfully minted ${data.amount} ${pluralize(data.amount, assetConfig)} on chain`,
        onError: (data, error) =>
          `Failed to mint ${data?.amount ?? ''} ${pluralize(data?.amount ?? 0, assetConfig)}: ${error.message}`,
      }}
    >
      <Recipients />
      <Amount />
      <Summary address={address} />
    </AssetForm>
  );
}
