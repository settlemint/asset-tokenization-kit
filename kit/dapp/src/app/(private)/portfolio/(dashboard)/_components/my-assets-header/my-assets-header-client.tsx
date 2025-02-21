'use client';

import { MyAssetsTransferForm } from '@/app/(private)/portfolio/(dashboard)/_components/my-assets-header/transfer-form/transfer';
import { defaultRefetchInterval } from '@/lib/react-query';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getMyAssets } from '../../../_components/data';
import { MyAssetsCount } from './my-assets-count/count-client';

interface MyAssetsHeaderClientProps {
  queryKey: QueryKey;
  wallet: Address;
}

export function MyAssetsHeaderClient({ queryKey, wallet }: MyAssetsHeaderClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: () => getMyAssets({ active: true, wallet: wallet }),
    refetchInterval: defaultRefetchInterval,
  });

  return (
    <div className="flex items-center justify-between">
      <MyAssetsCount total={data.total} />
      <MyAssetsTransferForm assets={data.balances} />
    </div>
  );
}
