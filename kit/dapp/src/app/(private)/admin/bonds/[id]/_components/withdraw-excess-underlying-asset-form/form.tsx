import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { WithdrawFormSchema } from './schema';
import { Summary } from './steps/summary';
import { To } from './steps/to';
import { withdrawExcessUnderlyingAssets } from './store';

export function WithdrawExcessUnderlyingAssetsForm({
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
      storeAction={withdrawExcessUnderlyingAssets}
      resolverAction={zodResolver(WithdrawFormSchema)}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Withdraw"
      submittingLabel="Withdrawing..."
      messages={{
        onCreate: () => `Withdrawing excess underlying assets from ${name} (${symbol})`,
        onSuccess: () => `Successfully withdrew excess underlying assets from ${name} (${symbol})`,
        onError: (_input, error) =>
          `Failed to withdraw excess underlying assets from ${name} (${symbol}): ${error.message}`,
      }}
    >
      <To />
      <Summary address={address} />
    </AssetForm>
  );
}
