'use client';

import { Stat, StatLabel, StatSubtext, StatValue } from '@/components/blocks/stat/stat';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getAssetsWidgetData } from './data';

interface DashboardWidgetClientProps {
  queryKey: string[];
}

export function AssetsWidgetClient({ queryKey }: DashboardWidgetClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getAssetsWidgetData,
    refetchInterval: 1000 * 10,
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
