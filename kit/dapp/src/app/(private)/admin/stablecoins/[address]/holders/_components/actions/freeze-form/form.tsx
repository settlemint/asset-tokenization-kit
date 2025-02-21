'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { useAuthenticatedUser } from '@/lib/auth/client';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { FreezeFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { freeze } from './store';

interface FreezeFormProps {
  address: Address;
  decimals: number;
  currentlyFrozen: number;
  currentBalance: number;
  assetConfig: AssetDetailConfig;
  onCloseAction: () => void;
}

export function FreezeForm({
  address,
  currentlyFrozen,
  currentBalance,
  assetConfig,
  decimals,
  onCloseAction,
}: FreezeFormProps) {
  const user = useAuthenticatedUser();

  if (!user) {
    return null;
  }

  return (
    <AssetForm
      storeAction={(formData) => freeze({ ...formData, address, userAddress: user.wallet })}
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
        userAddress: user.wallet,
        amount: 0,
        decimals,
      }}
    >
      <Amount currentBalance={currentBalance} currentlyFrozen={currentlyFrozen} />
      <Summary userAddress={user.wallet as Address} currentBalance={currentBalance} currentlyFrozen={currentlyFrozen} />
    </AssetForm>
  );
}
