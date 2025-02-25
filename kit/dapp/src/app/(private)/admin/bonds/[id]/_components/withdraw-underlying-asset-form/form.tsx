import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { WithdrawFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { To } from './steps/to';
import { withdrawUnderlyingAsset } from './store';

export function WithdrawUnderlyingAssetsForm({
  address,
  name,
  symbol,
  decimals,
  assetConfig,
  onCloseAction,
}: {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}) {
  return (
    <AssetForm
      storeAction={withdrawUnderlyingAsset}
      resolverAction={zodResolver(WithdrawFormSchema)}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Withdraw"
      submittingLabel="Withdrawing..."
      messages={{
        onCreate: () => `Withdrawing underlying assets from ${name} (${symbol})`,
        onSuccess: () => `Successfully withdrew underlying assets from ${name} (${symbol})`,
        onError: (_input, error) => `Failed to withdraw underlying assets from ${name} (${symbol}): ${error.message}`,
      }}
    >
      <To />
      <Amount />
      <Summary address={address} decimals={decimals} />
    </AssetForm>
  );
}
