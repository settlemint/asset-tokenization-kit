import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import { Suspense } from 'react';
import { AssetDetailsClient } from './asset-details-client';

export type AssetDetailsProps<
  Asset extends {
    id: string;
    name: string | null;
    symbol: string | null;
    decimals: number;
    totalSupply: string;
    collateral: string;
    paused: boolean;
  },
> = {
  id: string;
  dataAction: (id: string) => Promise<Asset>;
  type: string;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
};

export async function AssetDetails<
  Asset extends {
    id: string;
    name: string | null;
    symbol: string | null;
    decimals: number;
    totalSupply: string;
    collateral: string;
    paused: boolean;
  },
>({ id, dataAction, type, refetchInterval, icons }: AssetDetailsProps<Asset>) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [`${type}-${id}`],
    queryFn: () => dataAction(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <AssetDetailsClient
          id={id}
          refetchInterval={refetchInterval}
          type={type}
          dataAction={
            dataAction as (
              id: string
            ) => Promise<Asset & { totalSupplyExact: string; collateralExact: string; isin: string | null }>
          }
          icons={icons}
        />
      </Suspense>
    </HydrationBoundary>
  );
}
