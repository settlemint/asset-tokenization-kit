'use client';

import { PermissionsTableClient } from '@/components/blocks/asset-permissions-table/asset-permissions-table-client';
import { assetConfig } from '@/lib/config/assets';
import { queryKeys } from '@/lib/react-query';
import type { Address } from 'viem';
import { columns } from './columns';

export function TableClient({ asset }: { asset: Address }) {
  return (
    <PermissionsTableClient
      queryKey={queryKeys.asset.stats({ address: asset, type: 'holders' })}
      asset={asset}
      columns={columns(asset, assetConfig.stablecoin)}
    />
  );
}
