'use client';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Children, Fragment, type ReactElement, type ReactNode, Suspense, isValidElement } from 'react';
import type { Address } from 'viem';
import { AssetDetailGridItemSkeleton } from './asset-detail-grid-item';

export interface AssetDetailGridClientProps<Asset extends Record<string, unknown>> {
  asset: Address;
  assetConfig: AssetDetailConfig;
  /** Function to fetch the asset data */
  dataAction: (asset: Address) => Promise<Asset>;
  /** Column definitions for the table */
  itemsAction: (asset: Asset) => ReactNode;
  refetchInterval?: number;
}

export function AssetDetailGridClient<Asset extends Record<string, unknown>>({
  asset,
  assetConfig,
  dataAction,
  itemsAction,
  refetchInterval,
}: AssetDetailGridClientProps<Asset>) {
  const queryKey = [...assetConfig.queryKey, asset];

  const { data } = useSuspenseQuery<Asset>({
    queryKey,
    queryFn: () => dataAction(asset),
    refetchInterval,
  });

  const content = itemsAction(data);
  if (!isValidElement(content)) {
    return content;
  }

  // If the content is a fragment with multiple children, wrap each child in Suspense
  if (content.type === Fragment) {
    const fragmentContent = content as ReactElement<{ children: ReactNode[] }>;
    return Children.map(fragmentContent.props.children, (child) => (
      <Suspense fallback={<AssetDetailGridItemSkeleton />}>{child}</Suspense>
    ));
  }

  // If it's a single element, wrap it in Suspense
  return <Suspense fallback={<AssetDetailGridItemSkeleton />}>{content}</Suspense>;
}
