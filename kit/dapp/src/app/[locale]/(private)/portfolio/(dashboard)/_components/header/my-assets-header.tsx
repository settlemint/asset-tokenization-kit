'use client';

import { MyAssetsTransferForm } from '@/app/(private)/portfolio/(dashboard)/_components/my-assets-header/transfer-form/transfer';
import type { QueryKey } from '@tanstack/react-query';
import type { Address } from 'viem';
import { useMyAssets } from '../data'; // We'll need to create this hook
import { MyAssetsCount } from './my-assets-count/count-client';

interface MyAssetsHeaderClientProps {
  queryKey: QueryKey;
  wallet: Address;
}

export function MyAssetsHeaderClient({ queryKey, wallet }: MyAssetsHeaderClientProps) {
  const {
    data: { total, balances },
  } = useMyAssets({
    active: true,
    wallet,
  });

  return (
    <div className="flex items-center justify-between">
      <MyAssetsCount total={total} />
      <MyAssetsTransferForm assets={balances} />
    </div>
  );
}
