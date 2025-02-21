'use client';

import { getMyAssets } from '@/components/blocks/my-assets-table/data';
import {} from '@/components/ui/sheet';
import { formatNumber } from '@/lib/number';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';

interface MyAssetsClientProps {
  queryKey: QueryKey;
}

export function MyAssetsCountClient({ queryKey }: MyAssetsClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: () => getMyAssets(),
  });

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="mr-1 font-bold text-4xl">{formatNumber(data.total)}</span>
        <span>assets</span>
      </div>
    </div>
  );
}
