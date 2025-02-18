'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { BlockUserFormSchema } from './schema';
import { Summary } from './steps/summary';
import { blockUser } from './store';

interface BlockUserFormProps {
  address: Address;
  userAddress: Address;
  blocked: boolean;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}

export function BlockUserForm({ address, userAddress, blocked, assetConfig, onCloseAction }: BlockUserFormProps) {
  const actionLabel = blocked ? 'Unblock' : 'Block';
  const actionSubmittingLabel = actionLabel === 'Block' ? 'Blocking' : 'Unblocking';
  const actionSuccessLabel = actionLabel === 'Block' ? 'Blocked' : 'Unblocked';

  return (
    <AssetForm
      storeAction={(formData) => blockUser({ ...formData, address, userAddress, blocked: !!blocked })}
      resolverAction={zodResolver(BlockUserFormSchema)}
      onClose={onCloseAction}
      cacheInvalidation={{
        clientCacheKeys: [[...assetConfig.queryKey, { id: address }]],
        serverCachePath: () => `/admin/stablecoins/${address}`,
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
      <Summary address={address} userAddress={userAddress} blocked={blocked} />
    </AssetForm>
  );
}
