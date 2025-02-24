'use client';
import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { formatNumber } from '@/lib/number';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { type ApproveFormAssetType, getApproveFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recipients';
import { Summary } from './steps/summary';
import { approveAllowance } from './store';

export function ApproveAllowanceForm({
  address,
  name,
  symbol,
  decimals,
  assetConfig,
  balance,
  assetType,
  onCloseAction,
}: {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  assetConfig: AssetDetailConfig;
  balance: number;
  assetType: ApproveFormAssetType;
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
        onSuccess: ({ to }) => `${to} approved successfully on chain`,
        onError: ({ amount }, error) =>
          `Failed to approve ${formatNumber(amount, { token: symbol })}: ${error.message}`,
      }}
    >
      <Recipients />
      <Amount amountLimit={balance} />
      <Summary address={address} decimals={decimals} assetType={assetType} />
    </AssetForm>
  );
}
