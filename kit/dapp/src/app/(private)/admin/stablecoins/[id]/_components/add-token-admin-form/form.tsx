import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { AddTokenAdminFormSchema } from './schema';
import { AdminAddress } from './steps/address';
import { AdminRoles } from './steps/roles';
import { Summary } from './steps/summary';
import { addTokenAdmin } from './store';

export function AddTokenAdminForm({
  address,
  name,
  symbol,
  assetConfig,
  onCloseAction,
}: {
  address: Address;
  name: string;
  symbol: string;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}) {
  return (
    <AssetForm
      storeAction={addTokenAdmin}
      resolverAction={zodResolver(AddTokenAdminFormSchema)}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Add Admin"
      submittingLabel="Adding Admin..."
      messages={{
        onCreate: () => `Adding admin for ${name} (${symbol})`,
        onSuccess: () => `Admin added successfully for ${name} (${symbol})`,
        onError: (_input, error) => `Failed to add admin for ${name} (${symbol}): ${error.message}`,
      }}
    >
      <AdminAddress />
      <AdminRoles />
      <Summary address={address} />
    </AssetForm>
  );
}
