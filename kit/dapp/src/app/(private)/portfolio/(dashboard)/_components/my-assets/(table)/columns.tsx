'use client';
import type { MyAsset } from '@/app/(private)/portfolio/_components/data';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { numericSortingFn } from '@/components/blocks/data-table/sorting';
import { Badge } from '@/components/ui/badge';
import { assetConfig } from '@/lib/config/assets';
import { formatNumber } from '@/lib/number';
import { formatAssetType } from '@/lib/utils/format-asset-type';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<MyAsset>();

export const columns = [
  columnHelper.accessor('asset', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Asset</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const asset = getValue();
      const assetType = asset.type.toLowerCase() as keyof typeof assetConfig;
      const assetColor = assetConfig[assetType].color;
      return (
        <DataTableColumnCell>
          <div className="flex items-center gap-2">
            <Badge className="h-2 w-2 rounded-full p-0" style={{ backgroundColor: assetColor }} />
            {`${asset.name} (${asset.symbol})`}
          </div>
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: false,
  }),
  columnHelper.accessor('asset.type', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Type</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{formatAssetType(getValue())}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('value', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Balance
      </DataTableColumnHeader>
    ),
    cell: ({ getValue }) => <DataTableColumnCell variant="numeric">{formatNumber(getValue())}</DataTableColumnCell>,
    enableColumnFilter: false,
    sortingFn: numericSortingFn<MyAsset>('value'),
  }),
];
