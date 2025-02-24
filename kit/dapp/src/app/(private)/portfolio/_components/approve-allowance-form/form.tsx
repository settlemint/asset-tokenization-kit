'use client';
import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { formatNumber } from '@/lib/number';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { getApproveFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recipients';
import { Summary } from './steps/summary';
import { approveAllowance } from './store';

export function ApproveAllowanceForm({
  address,
  symbol,
  decimals,
  assetConfig,
  balance,
  onCloseAction,
}: {
  address: Address;
  symbol: string;
  decimals: number;
  assetConfig: AssetDetailConfig;
  balance: number;
  onCloseAction?: () => void;
}) {
  return (
    <AssetForm
      storeAction={approveAllowance}
      resolverAction={zodResolver(getApproveFormSchema())}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Approve"
      submittingLabel="Approving..."
      messages={{
        onCreate: ({ amount }) => `Approving ${formatNumber(amount, { token: symbol })}...`,
        onSuccess: ({ amount }) => `${formatNumber(amount, { token: symbol })} successfully approved on chain`,
        onError: ({ amount }, error) =>
          `Failed to approve ${formatNumber(amount, { token: symbol })}: ${error.message}`,
      }}
    >
      <Recipients />
      <Amount amountLimit={balance} />
      <Summary address={address} decimals={decimals} assetType={assetConfig.queryKey} />
    </AssetForm>
  );
}
