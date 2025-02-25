import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { TopUpFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { topUpUnderlyingAsset } from './store';

export function TopUpUnderlyingAssetsForm({
  address,
  name,
  symbol,
  decimals,
  underlyingAssetAddress,
  assetConfig,
  onCloseAction,
}: {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  underlyingAssetAddress: Address;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}) {
  return (
    <AssetForm
      storeAction={topUpUnderlyingAsset}
      resolverAction={zodResolver(TopUpFormSchema)}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Top Up"
      submittingLabel="Topping Up..."
      messages={{
        onCreate: () => `Topping up underlying assets for ${name} (${symbol})`,
        onSuccess: () => `Successfully topped up underlying assets for ${name} (${symbol})`,
        onError: (_input, error) => `Failed to top up underlying assets for ${name} (${symbol}): ${error.message}`,
      }}
    >
      <Amount />
      <Summary address={address} decimals={decimals} underlyingAssetAddress={underlyingAssetAddress} />
    </AssetForm>
  );
}
