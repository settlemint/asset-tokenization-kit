import { getAssetBalanceList } from '@/lib/queries/asset-balance/asset-balance-list';
import { formatNumber } from '@/lib/utils/number';
import type { Address } from 'viem';

interface EvmAddressBalancesProps {
  address: Address;
}

export async function EvmAddressBalances({ address }: EvmAddressBalancesProps) {
  const balances = await getAssetBalanceList({ wallet: address });

  return (
    <div className="flex flex-col gap-1 mt-4">
      {balances.map((balance) => (
        <div
          key={balance.asset.id}
          className="flex items-center justify-between"
        >
          <span className="text-sm font-medium">{balance.asset.symbol}</span>
          <span className="text-sm text-muted-foreground">
            {formatNumber(balance.value.getValue())}
          </span>
        </div>
      ))}
    </div>
  );
}
