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
  currentlyBlocked: boolean;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}

export function BlockUserForm({
  address,
  userAddress,
  currentlyBlocked,
  assetConfig,
  onCloseAction,
}: BlockUserFormProps) {
  const actionLabel = currentlyBlocked ? 'Unblock' : 'Block';
  const actionSubmittingLabel = currentlyBlocked ? 'Unblocking' : 'Blocking';
  const actionSuccessLabel = currentlyBlocked ? 'Unblocked' : 'Blocked';

  return (
    <AssetForm
      storeAction={(formData) => blockUser({ ...formData, address, userAddress })}
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
        blocked: !currentlyBlocked,
      }}
    >
      <Summary userAddress={userAddress} blocked={currentlyBlocked} />
    </AssetForm>
  );
}
