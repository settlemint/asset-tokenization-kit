'use client';

import { Card, CardContent } from '@/components/ui/card';
import { defaultRefetchInterval } from '@/lib/react-query';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { getAssetsWidgetData } from '../../common/assets/data';
import { StatLabel } from '../stat/stat-label';
import { StatSubtext } from '../stat/stat-subtext';
import { StatValue } from '../stat/stat-value';

interface DashboardWidgetClientProps {
  queryKey: QueryKey;
}

export function AssetsWidgetClient({ queryKey }: DashboardWidgetClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getAssetsWidgetData,
    refetchInterval: defaultRefetchInterval,
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
