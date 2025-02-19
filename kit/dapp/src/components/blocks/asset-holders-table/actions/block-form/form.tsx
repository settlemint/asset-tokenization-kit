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
      assetConfig={assetConfig}
      address={address}
      submitLabel={actionLabel}
      submittingLabel={actionSubmittingLabel}
      messages={{
        onCreate: () => `${actionSubmittingLabel} user...`,
        onSuccess: () => `Successfully ${actionSuccessLabel.toLowerCase()} user`,
        onError: (_, error) => `Failed to ${actionLabel.toLowerCase()} user: ${error.message}`,
      }}
      defaultValues={{
        address,
        userAddress,
        blocked,
      }}
    >
      <Summary userAddress={userAddress} blocked={blocked} />
    </AssetForm>
  );
}
