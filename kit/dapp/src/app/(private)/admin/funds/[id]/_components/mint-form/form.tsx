'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { pluralize } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { MintFundFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recipients';
import { Summary } from './steps/summary';
import { mintFund } from './store';

export function MintFundForm({
  address,
  assetConfig,
  onClose,
}: {
  address: Address;
  assetConfig: AssetDetailConfig;
  onClose: () => void;
}) {
  return (
    <AssetForm
      invalidate={[assetConfig.queryKey, ['transactions']]}
      storeAction={(formData) => mintFund({ ...formData, address })}
      resolverAction={zodResolver(MintFundFormSchema)}
      onClose={onClose}
      submitLabel="Mint"
      submittingLabel="Minting..."
      messages={{
        onCreate: (data) => `Minting ${data.amount} ${pluralize(data.amount, 'token')}...`,
        onSuccess: (data) => `Successfully minted ${data.amount} ${pluralize(data.amount, 'token')} on chain`,
        onError: (data, error) =>
          `Failed to mint ${data?.amount ?? ''} ${pluralize(data?.amount ?? 0, 'token')}: ${error.message}`,
      }}
    >
      <Recipients />
      <Amount />
      <Summary address={address} />
    </AssetForm>
  );
}
