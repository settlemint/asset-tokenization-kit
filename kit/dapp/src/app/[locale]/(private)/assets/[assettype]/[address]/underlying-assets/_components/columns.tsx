'use client';

import { AssetStatusPill } from '@/components/blocks/asset-status-pill/asset-status-pill';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import type { getAssetBalanceList } from '@/lib/queries/asset-balance/asset-balance-list';
import { formatDate } from '@/lib/utils/date';
import { formatAssetStatus } from '@/lib/utils/format-asset-status';
import { formatNumber } from '@/lib/utils/number';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { getAddress } from 'viem';

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getAssetBalanceList>>[number]>();

export function columns() {
  const t = useTranslations('private.assets.fields');

  return [
    columnHelper.accessor('asset.id', {
      header: t('wallet-header'),
      cell: ({ getValue }) => {
        const wallet = getAddress(getValue());
        return (
          <EvmAddress address={wallet} copyToClipboard={true} verbose={true}>
            <EvmAddressBalances address={wallet} />
          </EvmAddress>
        );
      },
      enableColumnFilter: false,
    }),
    columnHelper.accessor('value', {
      header: t('balance-header'),
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), { token: row.original.asset.symbol }),
      enableColumnFilter: false,
      meta: {
        variant: 'numeric',
      },
    }),
    columnHelper.accessor('frozen', {
      header: t('frozen-header'),
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), { token: row.original.asset.symbol }),
      enableColumnFilter: false,
      meta: {
        variant: 'numeric',
      },
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
    columnHelper.display({
      id: 'actions',
      header: t('actions-header'),
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            detailUrl={`/assets/${row.original.asset.type}/${row.original.asset.id}`}
          />
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
