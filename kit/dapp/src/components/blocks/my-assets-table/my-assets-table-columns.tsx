'use client';

import { AssetStatusPill } from '@/components/blocks/asset-status-pill/asset-status-pill';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import type { UserAsset } from '@/lib/queries/asset-balance/asset-balance-user';
import { formatAssetStatus } from '@/lib/utils/format-asset-status';
import { formatNumber } from '@/lib/utils/number';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

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
    columnHelper.accessor((row) => t(row.asset.type), {
      id: t('type-header'),
      header: t('type-header'),
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
    columnHelper.accessor((row) => formatAssetStatus(row, t), {
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
