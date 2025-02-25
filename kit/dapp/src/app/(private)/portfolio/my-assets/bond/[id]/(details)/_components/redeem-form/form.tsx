'use client';
import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { formatNumber } from '@/lib/number';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Address } from 'viem';
import { getRedeemFormSchema } from './schema';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';
import { redeemBond } from './store';

export function RedeemBondForm({
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
      storeAction={redeemBond}
      resolverAction={zodResolver(getRedeemFormSchema())}
      onClose={onCloseAction}
      assetConfig={assetConfig}
      address={address}
      submitLabel="Redeem"
      submittingLabel="Redeeming..."
      messages={{
        onCreate: ({ amount }) => `Redeeming ${formatNumber(amount, { token: symbol })}...`,
        onSuccess: ({ amount }) => `${formatNumber(amount, { token: symbol })} successfully redeemed`,
        onError: ({ amount }, error) => `Failed to redeem ${formatNumber(amount, { token: symbol })}: ${error.message}`,
      }}
    >
      <Amount amountLimit={balance} />
      <Summary address={address} decimals={decimals} />
    </AssetForm>
  );
}
