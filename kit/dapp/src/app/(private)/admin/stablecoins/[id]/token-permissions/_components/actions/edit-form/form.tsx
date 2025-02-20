'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { PermissionRole } from '@/components/blocks/asset-permissions-table/asset-permissions-table-data';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { EditRolesFormSchema } from './schema';
import { Summary } from './steps/summary';
import { editRoles } from './store';

interface EditPermissionsFormProps {
  address: Address;
  userAddress: Address;
  currentRoles: PermissionRole[];
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
        newRoles: currentRoles,
      }}
    >
      {/* TODO: form */}
      <Summary userAddress={userAddress} roles={currentRoles} />
    </AssetForm>
  );
}
