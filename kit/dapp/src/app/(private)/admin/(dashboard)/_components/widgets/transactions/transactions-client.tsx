'use client';

import { StatLabel, StatSubtext, StatValue } from '@/components/blocks/stat/stat';
import { Card, CardContent } from '@/components/ui/card';
import type { QueryKey } from '@tanstack/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getTransactionsWidgetData } from './data';

interface TransactionsWidgetClientProps {
  queryKey: QueryKey;
}

export function TransactionsWidgetClient({ queryKey }: TransactionsWidgetClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getTransactionsWidgetData,
    refetchInterval: 1000 * 10,
  });

  return (
    <Card>
      <CardContent>
        <StatLabel>Transactions</StatLabel>
        <StatValue>{data.totalTransactions.toLocaleString()}</StatValue>
        <StatSubtext>{data.transactionsInLast24Hours.toLocaleString()} in last 24 hours</StatSubtext>
      </CardContent>
    </Card>
  );
}
