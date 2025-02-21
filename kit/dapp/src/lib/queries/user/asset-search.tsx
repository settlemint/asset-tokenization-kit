import { Prefetch } from '@/components/blocks/prefetch/prefetch';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PropsWithChildren, ReactNode } from 'react';
import { type Address, getAddress } from 'viem';
import { AssetFragment } from './asset-fragment';

const AssetSearch = theGraphGraphqlStarterkits(
  `
  query SearchAssets($searchAddress: Bytes!, $search: String!) {
    assets(
      where: {
        or: [
          { name_contains_nocase: $search },
          { symbol_contains_nocase: $search },
          { id: $searchAddress }
        ]
      },
      first: 10
    ) {
      ...AssetFragment
    }
  }
`,
  [AssetFragment]
);

export interface AssetSearchProps {
  address: Address;
}

async function getAssetSearch({ address }: AssetSearchProps) {
  if (!address) {
    return [];
  }
  const result = await theGraphClientStarterkits.request(AssetSearch, { searchAddress: address, search: address });
  if (!result.assets) {
    return [];
  }
  return result.assets;
}

const queryKey = ({ address }: AssetSearchProps) => ['asset', 'search', getAddress(address)] as const;

export function useAssetSearch({ address }: AssetSearchProps) {
  const result = useSuspenseQuery({
    queryKey: queryKey({ address }),
    queryFn: () => getAssetSearch({ address }),
  });

  return {
    ...result,
    queryKey: queryKey({ address }),
  };
}

export function PrefetchAssetDetail({
  address,
  children,
  fallback,
}: PropsWithChildren<AssetSearchProps & { fallback?: ReactNode }>) {
  return (
    <Prefetch
      fallback={fallback}
      queries={[
        {
          queryKey: queryKey({ address }),
          queryFn: () => getAssetSearch({ address }),
        },
      ]}
    >
      {children}
    </Prefetch>
  );
}
