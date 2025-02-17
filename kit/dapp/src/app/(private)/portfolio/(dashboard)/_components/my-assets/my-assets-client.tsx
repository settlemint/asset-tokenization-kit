'use client';

import { Button } from '@/components/ui/button';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { ArrowUpFromLine } from 'lucide-react';
import { getMyAssets } from '../../../_components/my-assets/data';

interface MyAssetsClientProps {
  queryKey: QueryKey;
}

export function MyAssetsClient({ queryKey }: MyAssetsClientProps) {
  const { data } = useSuspenseQuery({
    queryKey: queryKey,
    queryFn: getMyAssets,
    refetchInterval: 1000 * 5,
  });

  const totalValue = data.reduce((acc, asset) => acc + Number(asset.value), 0);

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="mr-1 font-bold text-4xl">{totalValue}</span>
        <span>assets</span>
      </div>
      <Button className="w-1/6">
        <ArrowUpFromLine /> Transfer
      </Button>
    </div>
  );
}
