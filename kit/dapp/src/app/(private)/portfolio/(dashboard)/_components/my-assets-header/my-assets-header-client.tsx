'use client';

import { MyAssetsTransferForm } from '@/app/(private)/portfolio/(dashboard)/_components/my-assets-header/transfer-form/transfer';
import { getMyAssets } from '@/components/blocks/my-assets-table/data';
import { defaultRefetchInterval } from '@/lib/react-query';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { MyAssetsCount } from './my-assets-count/count-client';

interface MyAssetsHeaderClientProps {
  queryKey: QueryKey;
}

export function MyAssetsHeaderClient({ queryKey }: MyAssetsHeaderClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: () => getMyAssets(),
    refetchInterval: defaultRefetchInterval,
  });

  return (
    <div className="flex items-center justify-between">
      <MyAssetsCount total={data.total} />
      <MyAssetsTransferForm assets={data.balances} />
    </div>
  );
}
