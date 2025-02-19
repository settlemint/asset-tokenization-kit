'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { QueryKey } from '@tanstack/react-query';
import { useSuspenseQuery } from '@tanstack/react-query';
import { StatLabel } from '../stat/stat-label';
import { StatSubtext } from '../stat/stat-subtext';
import { StatValue } from '../stat/stat-value';
import { getTransactionsWidgetData } from './data';

interface TransactionsWidgetClientProps {
  queryKey: QueryKey;
}

export function TransactionsWidgetClient({ queryKey }: TransactionsWidgetClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getTransactionsWidgetData,
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
