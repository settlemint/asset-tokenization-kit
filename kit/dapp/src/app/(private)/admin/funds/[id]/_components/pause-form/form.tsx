'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { PauseFundFormSchema } from './schema';
import { Summary } from './steps/summary';
import { pauseFund } from './store';

export function PauseFundForm({
  address,
  paused,
  assetConfig,
  onClose,
}: {
  address: Address;
  paused: boolean;
  assetConfig: AssetDetailConfig;
  onClose: () => void;
}) {
  const action = paused ? 'Unpause' : 'Pause';

  return (
    <AssetForm
      invalidate={[assetConfig.queryKey, ['transactions']]}
      storeAction={(formData) => pauseFund({ ...formData, address, paused })}
      resolverAction={zodResolver(PauseFundFormSchema)}
      onClose={onClose}
      submitLabel={action}
      submittingLabel={`${action}ing...`}
      messages={{
        onCreate: () => `${action}ing ${assetConfig.name}...`,
        onSuccess: () => `Successfully ${action.toLowerCase()}d ${assetConfig.name} on chain`,
        onError: (_, error) => `Failed to ${action.toLowerCase()} ${assetConfig.name}: ${error.message}`,
      }}
    >
      <Summary address={address} paused={paused} />
    </AssetForm>
  );
}
