import { Prefetch } from '@/components/blocks/prefetch/prefetch';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PropsWithChildren, ReactNode } from 'react';
import { type Address, getAddress } from 'viem';
import { AssetFragment } from './asset-fragment';

const AssetDetail = theGraphGraphqlStarterkits(
  `
  query AssetDetail($id: ID = "") {
    asset(id: $id) {
      ...AssetFragment
    }
  }
`,
  [AssetFragment]
);

export interface AssetDetailProps {
  address: Address;
}

async function getAssetDetail({ address }: AssetDetailProps) {
  if (!address) {
    return undefined;
  }
  const result = await theGraphClientStarterkits.request(AssetDetail, { id: address });
  if (!result.asset) {
    return undefined;
  }
  return result.asset;
}

const queryKey = ({ address }: AssetDetailProps) => ['asset', 'detail', getAddress(address)] as const;

export function useAssetDetail({ address }: AssetDetailProps) {
  const result = useSuspenseQuery({
    queryKey: queryKey({ address }),
    queryFn: () => getAssetDetail({ address }),
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
}: PropsWithChildren<AssetDetailProps & { fallback?: ReactNode }>) {
  return (
    <Prefetch
      fallback={fallback}
      queries={[
        {
          queryKey: queryKey({ address }),
          queryFn: () => getAssetDetail({ address }),
        },
      ]}
    >
      {children}
    </Prefetch>
  );
}
