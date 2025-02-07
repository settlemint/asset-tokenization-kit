import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { assetConfig } from '@/lib/config/assets';
import { formatAssetType } from '@/lib/utils/format-asset-type';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { type TransferFormAssetType, TransferFormSchema } from './schema';
import { Recipients } from './steps/recipients';
import { Summary } from './steps/summary';
import { Amount } from './steps/value';
import { transfer } from './store';

export function TransferForm({
  address,
  name,
  symbol,
  assetType,
  balance,
  onClose,
}: {
  address: Address;
  name: string;
  symbol: string;
  assetType: TransferFormAssetType;
  balance: number;
  onClose: () => void;
}) {
  const assetConfig = getAssetConfig(assetType);
  return (
    <AssetForm
      invalidate={[assetConfig.queryKey, ['transactions']]}
      storeAction={transfer}
      resolverAction={zodResolver(TransferFormSchema)}
      onClose={onClose}
      submitLabel="Transfer"
      messages={{
        onCreate: (input) =>
          `Transferring  ${input.value} ${name} (${symbol}) ${formatAssetType(assetType)} to ${input.to}`,
        onSuccess: (input) =>
          `Transferred ${input.value} ${name} (${symbol}) ${formatAssetType(assetType)} to ${input.to} successfully on chain`,
        onError: (input, error) =>
          `Failed to transfer ${input.value} ${name} (${symbol}) ${formatAssetType(assetType)} to ${input.to}: ${error.message}`,
      }}
    >
      <Recipients />
      <Amount balance={balance} />
      <Summary address={address} assetType={assetType} />
    </AssetForm>
  );
}

function getAssetConfig(assetType: TransferFormAssetType) {
  const config = assetConfig[assetType];
  if (!config) {
    throw new Error(`Asset config not found for asset type: ${assetType}`);
  }
  return config;
}
