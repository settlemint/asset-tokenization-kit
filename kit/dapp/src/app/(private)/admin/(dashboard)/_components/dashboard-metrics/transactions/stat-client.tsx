'use client';

import { Stat, StatLabel, StatSubtext, StatValue } from '@/components/blocks/stat/stat';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ProcessedTransactionsData } from './data';

export function ProcessedTransactionsStatClient({
  refetchInterval,
  dataAction,
  queryKey,
}: { refetchInterval?: number; dataAction: () => Promise<ProcessedTransactionsData>; queryKey: string }) {
  const { data } = useSuspenseQuery({
    queryKey: [queryKey],
    queryFn: () => dataAction(),
    refetchInterval,
    staleTime: 0,
    gcTime: 1000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });

  return (
    <Stat>
      <StatLabel>Processed transactions</StatLabel>
      <StatValue>{data.totalTransactions.toLocaleString()}</StatValue>
      <StatSubtext>{data.transactionsInLast24Hours.toLocaleString()} in last 24 hours</StatSubtext>
    </Stat>
  );
}
