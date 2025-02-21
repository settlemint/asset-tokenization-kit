import { Prefetch } from '@/components/blocks/prefetch/prefetch';
import { assetConfig } from '@/lib/config/assets';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/utils/pagination';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PropsWithChildren, ReactNode } from 'react';
import { getAddress } from 'viem';
import { OffchainStableCoinFragment, StableCoinFragment } from './stablecoin-fragment';

const StableCoinList = theGraphGraphqlStarterkits(
  `
  query StableCoinList($first: Int, $skip: Int) {
    stableCoins(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...StableCoinFragment
    }
  }
`,
  [StableCoinFragment]
);

const OffchainStableCoinList = hasuraGraphql(
  `
  query OffchainStableCoinList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainStableCoinFragment
      }
    }
  }
`,
  [OffchainStableCoinFragment]
);

export async function getStableCoinList() {
  const [theGraphStableCoins, dbAssets] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(StableCoinList, { first, skip });
      return result.stableCoins;
    }),
    fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(OffchainStableCoinList, { limit, offset });
      return result.asset_aggregate.nodes;
    }),
  ]);

  const assetsById = new Map(dbAssets.map((asset) => [getAddress(asset.id), asset]));

  const stableCoins = theGraphStableCoins.map((stableCoin) => {
    const dbAsset = assetsById.get(getAddress(stableCoin.id));
    return {
      ...stableCoin,
      ...{
        private: false,
        ...dbAsset,
      },
    };
  });

  return stableCoins;
}
export type StableCoinListResult = Awaited<ReturnType<typeof getStableCoinList>>[number];

const queryKey = () => ['asset', assetConfig.stablecoin.queryKey] as const;

export function useStableCoinList() {
  const result = useSuspenseQuery({
    queryKey: queryKey(),
    queryFn: () => getStableCoinList(),
  });

  return {
    ...result,
    config: assetConfig.stablecoin,
    queryKey: queryKey(),
  };
}

export function PrefetchStableCoinList({ children, fallback }: PropsWithChildren<{ fallback?: ReactNode }>) {
  return (
    <Prefetch
      fallback={fallback}
      queries={[
        {
          queryKey: queryKey(),
          queryFn: () => getStableCoinList(),
        },
      ]}
    >
      {children}
    </Prefetch>
  );
}
