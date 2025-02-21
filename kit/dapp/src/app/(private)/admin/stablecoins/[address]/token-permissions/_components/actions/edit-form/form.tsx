'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import type { Role } from '@/lib/config/roles';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { EditRolesFormSchema } from './schema';
import { RolesForm } from './steps/roles';
import { Summary } from './steps/summary';
import { editRoles } from './store';

interface EditPermissionsFormProps {
  address: Address;
  userAddress: Address;
  currentRoles: Role[];
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}

export function EditRolesForm({
  address,
  userAddress,
  currentRoles,
  assetConfig,
  onCloseAction,
}: EditPermissionsFormProps) {
  return (
    <AssetForm
      storeAction={(formData) => editRoles({ ...formData, address, userAddress, currentRoles })}
      resolverAction={zodResolver(EditRolesFormSchema)}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Confirm"
      submittingLabel="Saving..."
      messages={{
        onCreate: () => 'Updating roles...',
        onSuccess: () => 'Successfully updated roles',
        onError: (_, error) => `Failed to update roles: ${error.message}`,
      }}
      defaultValues={{
        address,
        userAddress,
        currentRoles,
      }}
    >
      <RolesForm currentRoles={currentRoles} />
      <Summary userAddress={userAddress} currentRoles={currentRoles} />
    </AssetForm>
  );
}
