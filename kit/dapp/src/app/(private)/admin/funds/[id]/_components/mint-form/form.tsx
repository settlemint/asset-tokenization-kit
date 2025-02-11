'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
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
    >
      <Recipients />
      <Amount />
      <Summary address={address} />
    </AssetForm>
  );
}
