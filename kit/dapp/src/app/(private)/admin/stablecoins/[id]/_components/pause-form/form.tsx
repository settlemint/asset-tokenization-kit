'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { PauseFormSchema } from './schema';
import { Summary } from './steps/summary';
import { pauseStablecoin } from './store';

interface PauseStablecoinFormProps {
  address: Address;
  paused: boolean;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}

export function PauseStablecoinForm({ address, paused, assetConfig, onCloseAction }: PauseStablecoinFormProps) {
  const actionLabel = paused ? 'Unpause' : 'Pause';
  const actionSubmittingLabel = actionLabel === 'Pause' ? 'Pausing' : 'Unpausing';
  const actionSuccessLabel = actionLabel === 'Pause' ? 'Paused' : 'Unpaused';

  return (
    <AssetForm
      storeAction={(formData) => pauseStablecoin({ ...formData, address, paused })}
      resolverAction={zodResolver(PauseFormSchema)}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
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
