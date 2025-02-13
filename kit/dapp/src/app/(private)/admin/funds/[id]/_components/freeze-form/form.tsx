'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { FreezeFundFormSchema } from './schema';
import { Summary } from './steps/summary';
import { freezeFund } from './store';

interface FreezeFundFormProps {
  address: Address;
  assetConfig: AssetDetailConfig;
  onClose: () => void;
}

export function FreezeFundForm({ address, assetConfig, onClose }: FreezeFundFormProps) {
  return (
    <AssetForm
      storeAction={(formData) => freezeFund({ ...formData, address })}
      resolverAction={zodResolver(FreezeFundFormSchema)}
      onClose={onClose}
      cacheInvalidation={{
        clientCacheKeys: [[...assetConfig.queryKey, { id: address }]],
        serverCachePath: () => `/admin/funds/${address}`,
      }}
      submitLabel="Freeze"
      submittingLabel="Freezing"
      messages={{
        onCreate: () => `Freezing account in ${assetConfig.name.toLowerCase()}...`,
        onSuccess: () => `Successfully froze account in ${assetConfig.name.toLowerCase()} on chain`,
        onError: (_, error) => `Failed to freeze account in ${assetConfig.name.toLowerCase()}: ${error.message}`,
      }}
    >
      <Summary address={address} />
    </AssetForm>
  );
}
