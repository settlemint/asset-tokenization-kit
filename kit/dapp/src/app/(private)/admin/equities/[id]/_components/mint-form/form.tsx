import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { MintFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recipients';
import { Summary } from './steps/summary';
import { mintEquity } from './store';

export function MintForm({
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
      storeAction={mintEquity}
      resolverAction={zodResolver(MintFormSchema)}
      onClose={onCloseAction}
      submitLabel="Mint"
      submittingLabel="Minting..."
      messages={{
        onCreate: () => `Minting ${name} (${symbol})`,
        onSuccess: () => `${name} (${symbol}) minted successfully on chain`,
        onError: (_input, error) => `Failed to mint ${name} (${symbol}): ${error.message}`,
      }}
    >
      <Recipients />
      <Amount />
      <Summary address={address} decimals={decimals} />
    </AssetForm>
  );
}
