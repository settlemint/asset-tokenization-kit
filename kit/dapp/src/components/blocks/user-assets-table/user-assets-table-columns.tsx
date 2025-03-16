'use client';

import { AssetStatusPill } from '@/components/blocks/asset-status-pill/asset-status-pill';
import type { UserAsset } from '@/lib/queries/asset-balance/asset-balance-user';
import { formatDate } from '@/lib/utils/date';
import { formatAssetStatus } from '@/lib/utils/format-asset-status';
import { formatHolderType } from '@/lib/utils/format-holder-type';
import { formatNumber } from '@/lib/utils/number';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

const columnHelper = createColumnHelper<UserAsset>();

export function columns() {
  const t = useTranslations('admin.users.holdings.table');

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
    columnHelper.accessor((row) => formatHolderType(row, t), {
      id: t('holder-type-header'),
      header: t('holder-type-header'),
    }),
    columnHelper.accessor((row) => formatAssetStatus(row, t), {
      id: t('status-header'),
      header: t('status-header'),
      cell: ({ row }) => {
        return <AssetStatusPill assetBalance={row.original} />;
      },
    }),
    columnHelper.accessor('lastActivity', {
      header: t('last-activity-header'),
      cell: ({ getValue }) => {
        const lastActivity = getValue();
        return lastActivity
          ? formatDate(lastActivity, { type: 'distance' })
          : '-';
      },
      enableColumnFilter: false,
    }),
  ];
}
