'use client';
import { AssetTabHeader } from '@/components/blocks/asset-tabs/asset-tab-header';
import type { TokenTypeValue } from '@/types/token-types';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import type { StableCoinAsset } from '../../../../_components/data';
import { AssetTokenPermissionsTable } from './asset-token-permissions-table';

export type AssetTokenPermissionsProps<Asset> = {
  dataAction: (id: string) => Promise<Asset>;
  type: TokenTypeValue;
  id: string;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
};

export function AssetTokenPermissions<Asset extends StableCoinAsset>({
  dataAction,
  type,
  id,
  refetchInterval,
  icons,
}: AssetTokenPermissionsProps<Asset>) {
  const { data } = useSuspenseQuery<Asset>({
    queryKey: [`${type}-${id}`],
    queryFn: () => dataAction(id),
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });
  return (
    <div className="AssetTokenPermissions">
      <AssetTabHeader data={data} />
      <AssetTokenPermissionsTable<Asset> cells={[]} data={data} icons={icons ?? {}} name={type} />
    </div>
  );
}
