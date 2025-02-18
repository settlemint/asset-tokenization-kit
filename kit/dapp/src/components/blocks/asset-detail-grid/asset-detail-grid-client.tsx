'use client';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Address } from 'viem';

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

  return itemsAction(data);
}
