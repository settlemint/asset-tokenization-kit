'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { FreezeFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { freeze } from './store';

interface FreezeFormProps {
  address: Address;
  userAddress: Address;
  decimals: number;
  currentlyFrozen: string;
  currentBalance: string;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}

export function FreezeForm({
  address,
  userAddress,
  currentlyFrozen,
  currentBalance,
  assetConfig,
  decimals,
  onCloseAction,
}: FreezeFormProps) {
  return (
    <AssetForm
      storeAction={(formData) => freeze({ ...formData, address, userAddress })}
      resolverAction={zodResolver(FreezeFormSchema)}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel={'Freeze'}
      submittingLabel={'Freezing'}
      messages={{
        onCreate: () => 'Freezing...',
        onSuccess: () => 'Successfully frozen',
        onError: (_, error) => `Failed to freeze: ${error.message}`,
      }}
      defaultValues={{
        address,
        userAddress,
        amount: 0,
        decimals,
      }}
    >
      <Amount currentBalance={currentBalance} currentlyFrozen={currentlyFrozen} />
      <Summary userAddress={userAddress} currentBalance={currentBalance} currentlyFrozen={currentlyFrozen} />
    </AssetForm>
  );
}
