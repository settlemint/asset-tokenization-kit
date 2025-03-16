'use client';

import type { UserAsset } from '@/lib/queries/asset-balance/asset-balance-user';
import { formatNumber } from '@/lib/utils/number';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

const columnHelper = createColumnHelper<UserAsset>();

export function columnsSmall() {
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
  ];
}
