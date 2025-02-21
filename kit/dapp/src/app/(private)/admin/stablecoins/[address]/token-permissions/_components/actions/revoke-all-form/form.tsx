'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import type { Role } from '@/lib/config/roles';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { RevokeAllFormSchema } from './schema';
import { Summary } from './steps/summary';
import { revokeAll } from './store';

interface RevokeAllFormProps {
  address: Address;
  userAddress: Address;
  assetConfig: AssetDetailConfig;
  currentRoles: Role[];
  onCloseAction: () => void;
}

export function RevokeAllForm({ address, userAddress, assetConfig, currentRoles, onCloseAction }: RevokeAllFormProps) {
  return (
    <AssetForm
      storeAction={(formData) => revokeAll({ ...formData, address, userAddress })}
      resolverAction={zodResolver(RevokeAllFormSchema)}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Revoke All Permissions"
      submittingLabel="Revoking..."
      messages={{
        onCreate: () => 'Revoking all permissions...',
        onSuccess: () => 'Successfully revoked all permissions',
        onError: (_, error) => `Failed to revoke permissions: ${error.message}`,
      }}
      defaultValues={{
        address,
        userAddress,
        currentRoles,
      }}
    >
      <Summary userAddress={userAddress} currentRoles={currentRoles} />
    </AssetForm>
  );
}
