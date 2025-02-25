import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { MatureFormSchema } from './schema';
import { Summary } from './steps/summary';
import { matureBond } from './store';

export function MatureBondForm({
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
      storeAction={matureBond}
      resolverAction={zodResolver(MatureFormSchema)}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Mature Bond"
      submittingLabel="Maturing Bond..."
      messages={{
        onCreate: () => `Maturing bond ${name} (${symbol})`,
        onSuccess: () => `Successfully matured bond ${name} (${symbol})`,
        onError: (_input, error) => `Failed to mature bond ${name} (${symbol}): ${error.message}`,
      }}
    >
      <Summary address={address} />
    </AssetForm>
  );
}
