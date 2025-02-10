'use client';

import { Card, CardContent } from '@/components/ui/card';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { StatLabel } from '../stat/stat-label';
import { StatSubtext } from '../stat/stat-subtext';
import { StatValue } from '../stat/stat-value';
import { getAssetsWidgetData } from './data';

interface DashboardWidgetClientProps {
  queryKey: QueryKey;
}

export function AssetsWidgetClient({ queryKey }: DashboardWidgetClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getAssetsWidgetData,
    refetchInterval: 1000 * 10,
  });

  return (
    <Card>
      <CardContent>
        <StatLabel>Assets supply</StatLabel>
        <StatValue>{data.totalSupply.toLocaleString()}</StatValue>
        <StatSubtext>
          {data.breakdown.map((item) => `${item.supply.toLocaleString()} ${item.type}`).join(' | ')}
        </StatSubtext>
      </CardContent>
    </Card>
  );
}
