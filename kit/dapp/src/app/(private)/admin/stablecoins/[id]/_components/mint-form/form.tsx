import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { MintStablecoinFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recipients';
import { Summary } from './steps/summary';
import { mintStablecoin } from './store';

export function MintStablecoinForm({
  address,
  name,
  symbol,
  decimals,
  assetConfig,
  onClose,
}: {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  assetConfig: AssetDetailConfig;
  onClose: () => void;
}) {
  return (
    <AssetForm
      cacheInvalidation={{
        clientCacheKeys: [assetConfig.queryKey, ['transactions']],
      }}
      storeAction={mintStablecoin}
      resolverAction={zodResolver(MintStablecoinFormSchema)}
      onClose={onClose}
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
