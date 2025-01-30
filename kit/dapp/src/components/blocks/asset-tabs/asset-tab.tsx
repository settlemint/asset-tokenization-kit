import { getQueryClient } from '@/lib/react-query';
import type { TokenTypeValue } from '@/types/token-types';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { type ReactNode, Suspense } from 'react';
import { AssetTabList } from './asset-tab-list';

export type AssetDetailsProps<Asset> = {
  id: string;
  children?: ReactNode;
  type: TokenTypeValue;
  dataAction: (id: string) => Promise<Asset>;
  activeTab: 'details' | 'holders' | 'events' | 'blocklist' | 'token-permissions';
};

export async function AssetTab<Asset>({ id, dataAction, type, children, activeTab }: AssetDetailsProps<Asset>) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [`${type}-${id}`],
    queryFn: () => dataAction(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AssetTabList type={type} id={id} activeTab={activeTab}>
        <Suspense fallback={<div className="AssetTab">Loading...</div>}>
          <div className="AssetTab">{children}</div>
        </Suspense>
      </AssetTabList>
    </HydrationBoundary>
  );
}
