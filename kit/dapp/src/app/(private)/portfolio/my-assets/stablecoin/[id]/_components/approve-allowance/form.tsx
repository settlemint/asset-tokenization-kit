import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { getApproveFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recipients';
import { Summary } from './steps/summary';
import { approveStablecoin } from './store';

export function ApproveForm({
  address,
  name,
  symbol,
  decimals,
  assetConfig,
  balance,
  onCloseAction,
}: {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  assetConfig: AssetDetailConfig;
  balance: number;
  onCloseAction: () => void;
}) {
  return (
    <AssetForm
      storeAction={approveStablecoin}
      resolverAction={zodResolver(getApproveFormSchema())}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Approve"
      submittingLabel="Approving..."
      messages={{
        onCreate: ({ to }) => `Approving ${to}...`,
        onSuccess: ({ to }) => `${to} approved successfully on chain`,
        onError: ({ to }, error) => `Failed to approve ${to}: ${error.message}`,
      }}
    >
      <Recipients />
      <Amount amountLimit={balance} />
      <Summary address={address} decimals={decimals} />
    </AssetForm>
  );
}
