'use client';

import { AssetStatusPill } from '@/components/blocks/asset-status-pill/asset-status-pill';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import type { UserAsset } from '@/lib/queries/asset-balance/asset-balance-user';
import { formatNumber } from '@/lib/utils/number';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { ColumnAssetStatus } from '../asset-info/column-asset-status';
import { ColumnAssetType } from '../asset-info/column-asset-type';

const columnHelper = createColumnHelper<UserAsset>();

export function columns() {
  const t = useTranslations('portfolio.my-assets.table');

  return [
    columnHelper.accessor('asset.name', {
      header: t('name-header'),
      enableColumnFilter: false,
    }),
    columnHelper.accessor('asset.symbol', {
      header: t('symbol-header'),
      enableColumnFilter: false,
    }),
    columnHelper.accessor('asset.type', {
      header: t('type-header'),
      cell: ({ getValue }) => <ColumnAssetType assettype={getValue()} />,
    }),
    columnHelper.accessor('value', {
      header: t('balance-header'),
      meta: {
        variant: 'numeric',
      },
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), { token: row.original.asset.symbol }),
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => <ColumnAssetStatus assetOrBalance={row} />, {
      id: t('status-header'),
      header: t('status-header'),
      cell: ({ row }) => {
        return <AssetStatusPill assetBalance={row.original} />;
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: t('actions-header'),
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            detailUrl={`/portfolio/my-assets/${row.original.asset.type}/${row.original.asset.id}`}
          />
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
