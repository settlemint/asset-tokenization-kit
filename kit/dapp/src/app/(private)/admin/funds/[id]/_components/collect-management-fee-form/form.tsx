import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { CollectManagementFeeSchema } from './schema';
import { Summary } from './steps/summary';
import { collectManagementFee } from './store';

export function CollectManagementFeeForm({
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
      storeAction={collectManagementFee}
      resolverAction={zodResolver(CollectManagementFeeSchema)}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Collect Fee"
      submittingLabel="Collecting..."
      messages={{
        onCreate: () => `Collecting management fee for ${name} (${symbol})`,
        onSuccess: () => `Management fee for ${name} (${symbol}) collected successfully`,
        onError: (_input, error) => `Failed to collect management fee for ${name} (${symbol}): ${error.message}`,
      }}
    >
      <Summary address={address} />
    </AssetForm>
  );
}
