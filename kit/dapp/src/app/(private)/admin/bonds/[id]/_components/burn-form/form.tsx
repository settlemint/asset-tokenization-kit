import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { BurnFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { burnBonds } from './store';

export function BurnForm({
  address,
  name,
  symbol,
  decimals,
  assetConfig,
  onCloseAction,
  balance,
}: {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
  balance: number;
}) {
  return (
    <AssetForm
      cacheInvalidation={{
        clientCacheKeys: [assetConfig.queryKey, ['transactions']],
      }}
      storeAction={burnBonds}
      resolverAction={zodResolver(BurnFormSchema)}
      onClose={onCloseAction}
      submitLabel="Burn"
      submittingLabel="Burning..."
      messages={{
        onCreate: () => `Burning ${name} (${symbol})`,
        onSuccess: () => `${name} (${symbol}) burned successfully on chain`,
        onError: (_input, error) => `Failed to burn ${name} (${symbol}): ${error.message}`,
      }}
    >
      <Amount balance={balance} />
      <Summary address={address} decimals={decimals} />
    </AssetForm>
  );
}
