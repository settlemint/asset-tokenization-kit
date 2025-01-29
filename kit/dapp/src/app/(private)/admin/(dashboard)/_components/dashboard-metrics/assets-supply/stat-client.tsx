'use client';
import { Stat, StatLabel, StatSubtext, StatValue } from '@/components/blocks/stat/stat';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { AssetsSupplyData } from './data';

export function AssetTotalSupplyStatClient({
  refetchInterval,
  dataAction,
  queryKey,
}: { refetchInterval?: number; dataAction: () => Promise<AssetsSupplyData>; queryKey: string }) {
  const { data } = useSuspenseQuery({
    queryKey: [queryKey],
    queryFn: () => dataAction(),
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });

  return (
    <Stat>
      <StatLabel>Assets supply</StatLabel>
      <StatValue>{data.totalSupply.toLocaleString()}</StatValue>
      <StatSubtext>
        {data.breakdown.map((item) => `${item.supply.toLocaleString()} ${item.type}`).join(' | ')}
      </StatSubtext>
    </Stat>
  );
}
