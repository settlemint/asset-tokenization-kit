'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { BlockHolderFormSchema } from './schema';
import { Summary } from './steps/summary';
import { blockHolder } from './store';

interface BlockHolderFormProps {
  address: Address;
  holder: Address;
  blocked: boolean;
  onCloseAction: () => void;
}

export function BlockHolderForm({ address, holder, blocked, onCloseAction }: BlockHolderFormProps) {
  const actionLabel = blocked ? 'Unblock' : 'Block';
  const actionSubmittingLabel = blocked ? 'Unblocking' : 'Blocking';
  const actionSuccessLabel = blocked ? 'Unblocked' : 'Blocked';

  return (
    <AssetForm
      storeAction={(formData) => blockHolder({ ...formData, address, holder, blocked })}
      resolverAction={zodResolver(BlockHolderFormSchema)}
      onClose={onCloseAction}
      cacheInvalidation={{
        clientCacheKeys: [['stablecoin-holders', { id: address }]],
        serverCachePath: () => `/admin/stablecoins/${address}/holders`,
      }}
      submitLabel={actionLabel}
      submittingLabel={actionSubmittingLabel}
      messages={{
        onCreate: () => `${actionSubmittingLabel} holder...`,
        onSuccess: () => `Successfully ${actionSuccessLabel} holder on chain`,
        onError: (_, error) => `Failed to ${actionLabel.toLowerCase()} holder: ${error.message}`,
      }}
    >
      <Summary address={address} holder={holder} blocked={blocked} />
    </AssetForm>
  );
}
