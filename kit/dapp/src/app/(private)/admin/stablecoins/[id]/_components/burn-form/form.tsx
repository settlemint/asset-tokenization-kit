import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { getBurnFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { burnStablecoin } from './store';

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
  balance: string;
}) {
  return (
    <AssetForm
      storeAction={burnStablecoin}
      resolverAction={zodResolver(getBurnFormSchema(balance))}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Burn"
      submittingLabel="Burning..."
      messages={{
        onCreate: () => `Burning ${name} (${symbol})`,
        onSuccess: () => `${name} (${symbol}) burned successfully on chain`,
        onError: (_input, error) => `Failed to burn ${name} (${symbol}): ${error.message}`,
      }}
      defaultValues={{
        decimals,
      }}
    >
      <Amount balance={balance} />
      <Summary address={address} decimals={decimals} />
    </AssetForm>
  );
}
