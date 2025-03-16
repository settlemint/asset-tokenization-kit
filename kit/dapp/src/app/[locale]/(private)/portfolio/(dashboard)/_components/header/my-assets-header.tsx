'use client';

import type { AssetBalance } from '@/lib/queries/asset-balance/asset-balance-fragment';
import { MyAssetsTransferForm } from '../transfer-form/transfer-form';
import { MyAssetsCount } from './my-assets-count';

interface MyAssetsHeaderProps {
  data: {
    total: string;
    balances: AssetBalance[];
  };
}

export function MyAssetsHeader({ data }: MyAssetsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <MyAssetsCount total={data.total} />
      <MyAssetsTransferForm />
    </div>
  );
}
