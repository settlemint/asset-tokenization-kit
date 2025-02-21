'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { useAuthenticatedUser } from '@/lib/auth/client';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { BlockUserFormSchema } from './schema';
import { Summary } from './steps/summary';
import { blockUser } from './store';

interface BlockUserFormProps {
  address: Address;
  currentlyBlocked: boolean;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}

export function BlockUserForm({ address, currentlyBlocked, assetConfig, onCloseAction }: BlockUserFormProps) {
  const actionLabel = currentlyBlocked ? 'Unblock' : 'Block';
  const actionSubmittingLabel = currentlyBlocked ? 'Unblocking' : 'Blocking';
  const actionSuccessLabel = currentlyBlocked ? 'Unblocked' : 'Blocked';
  const user = useAuthenticatedUser();

  if (!user) {
    return null;
  }

  return (
    <AssetForm
      storeAction={(formData) => blockUser({ ...formData, address, userAddress: user.wallet })}
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
        userAddress: user.wallet,
        blocked: !currentlyBlocked,
      }}
    >
      <Summary blocked={currentlyBlocked} userAddress={user.wallet as Address} />
    </AssetForm>
  );
}
