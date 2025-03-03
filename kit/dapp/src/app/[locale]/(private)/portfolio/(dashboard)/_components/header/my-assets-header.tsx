'use client';

import type { BalanceFragmentType } from '@/lib/queries/portfolio/balance-fragment';
import type { Address } from 'viem';
import { MyAssetsTransferForm } from '../transfer-form/transfer-form';
import { MyAssetsCount } from './my-assets-count';

interface MyAssetsHeaderProps {
  wallet: Address;
  data: {
    total: string;
    balances: BalanceFragmentType[];
  };
}

export function MyAssetsHeader({  wallet, data }: MyAssetsHeaderProps) {


  return (
    <div className="flex items-center justify-between">
      <MyAssetsCount total={data.total} />
      <MyAssetsTransferForm assets={data.balances} />
    </div>
  );
}
