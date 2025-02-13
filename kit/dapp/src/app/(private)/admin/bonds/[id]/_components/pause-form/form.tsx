'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { PauseBondFormSchema } from './schema';
import { Summary } from './steps/summary';
import { pauseBond } from './store';

interface PauseBondFormProps {
  address: Address;
  paused: boolean;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}

export function PauseBondForm({ address, paused, assetConfig, onCloseAction }: PauseBondFormProps) {
  const actionLabel = paused ? 'Unpause' : 'Pause';
  const actionSubmittingLabel = actionLabel === 'Pause' ? 'Pausing' : 'Unpausing';
  const actionSuccessLabel = actionLabel === 'Pause' ? 'Paused' : 'Unpaused';

  return (
    <AssetForm
      storeAction={(formData) => pauseBond({ ...formData, address, paused })}
      resolverAction={zodResolver(PauseBondFormSchema)}
      onClose={onCloseAction}
      cacheInvalidation={{
        clientCacheKeys: [[...assetConfig.queryKey, { id: address }]],
        serverCachePath: () => `/admin/bonds/${address}`,
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
