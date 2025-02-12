'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { PauseFundFormSchema } from './schema';
import { Summary } from './steps/summary';
import { pauseFund } from './store';

interface PauseFundFormProps {
  address: Address;
  paused: boolean;
  assetConfig: AssetDetailConfig;
  onClose: () => void;
}

export function PauseFundForm({ address, paused, assetConfig, onClose }: PauseFundFormProps) {
  const actionLabel = paused ? 'Unpause' : 'Pause';
  const actionSubmittingLabel = actionLabel === 'Pause' ? 'Pausing' : 'Unpausing';
  const actionSuccessLabel = actionLabel === 'Pause' ? 'Paused' : 'Unpaused';

  return (
    <AssetForm
      storeAction={(formData) => pauseFund({ ...formData, address, paused })}
      resolverAction={zodResolver(PauseFundFormSchema)}
      onClose={onClose}
      cacheInvalidation={{
        clientCacheKeys: [[...assetConfig.queryKey, { id: address }]],
        serverCachePath: () => `/admin/funds/${address}`,
      }}
      submitLabel={actionLabel}
      submittingLabel={actionSubmittingLabel}
      messages={{
        onCreate: () => `${actionSubmittingLabel} ${assetConfig.name.toLowerCase()}...`,
        onSuccess: () => `Successfully ${actionSuccessLabel} ${assetConfig.name.toLowerCase()} on chain`,
        onError: (_, error) =>
          `Failed to ${actionLabel.toLowerCase()} ${assetConfig.name.toLowerCase()}: ${error.message}`,
      }}
    >
      <Summary address={address} paused={paused} />
    </AssetForm>
  );
}
