import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { BurnStablecoinFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { burnStablecoin } from './store';

export function BurnStablecoinForm({
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
      cacheInvalidation={{
        clientCacheKeys: [assetConfig.queryKey, ['transactions']],
      }}
      storeAction={burnStablecoin}
      resolverAction={zodResolver(BurnStablecoinFormSchema)}
      onClose={onCloseAction}
      submitLabel="Burn"
      submittingLabel="Burning..."
      messages={{
        onCreate: () => `Burning ${name} (${symbol})`,
        onSuccess: () => `${name} (${symbol}) burned successfully on chain`,
        onError: (_input, error) => `Failed to burn ${name} (${symbol}): ${error.message}`,
      }}
    >
      <Amount />
      <Summary address={address} decimals={decimals} />
    </AssetForm>
  );
}
