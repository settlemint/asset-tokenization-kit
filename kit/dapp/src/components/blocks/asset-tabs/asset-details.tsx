import { getQueryClient } from '@/lib/react-query';
import type { TokenTypeValue } from '@/types/token-types';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { type ReactNode, Suspense } from 'react';
import { AssetDetailsTabs } from './asset-details-tab';

export type AssetDetailsProps<Asset> = {
  id: string;
  children?: ReactNode;
  type: TokenTypeValue;
  dataAction: (id: string) => Promise<Asset>;
};

export async function AssetDetails<Asset>({ id, dataAction, type, children }: AssetDetailsProps<Asset>) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [`${type}-${id}`],
    queryFn: () => dataAction(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AssetDetailsTabs type={type} id={id}>
        <Suspense>
          <div className="AssetDetails">{children}</div>
        </Suspense>
      </AssetDetailsTabs>
    </HydrationBoundary>
  );
}
