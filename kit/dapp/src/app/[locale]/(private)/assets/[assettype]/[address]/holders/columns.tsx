'use client';

import { ColumnAssetStatus } from '@/components/blocks/asset-info/column-asset-status';
import { ColumnHolderType } from '@/components/blocks/asset-info/column-holder-type';
import { AssetStatusPill } from '@/components/blocks/asset-status-pill/asset-status-pill';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import type { getAssetBalanceList } from '@/lib/queries/asset-balance/asset-balance-list';
import { formatDate } from '@/lib/utils/date';
import { formatNumber } from '@/lib/utils/number';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { getAddress } from 'viem';
import { BlockForm } from '../_components/block-form/form';
import { FreezeForm } from '../_components/freeze-form/form';
import { MintForm } from '../_components/mint-form/form';

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getAssetBalanceList>>[number]>();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components

  const t = useTranslations('private.assets.details.holders');

  return [
    columnHelper.accessor('account.id', {
      header: t('fields.wallet-header'),
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
      header: t('fields.balance-header'),
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), { token: row.original.asset.symbol }),
      enableColumnFilter: false,
      meta: {
        variant: 'numeric',
      },
    }),
    columnHelper.accessor('asset', {
      id: t('holder-type-header'),
      header: t('holder-type-header'),
      cell: ({ row }) => {
        return <ColumnHolderType assetBalance={row.original} />;
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
    columnHelper.accessor((row) => <ColumnAssetStatus assetOrBalance={row} />, {
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
        const t = useTranslations('private.assets.details.forms');
        return (
          <DataTableRowActions
            actions={[
              {
                id: 'block-form',
                label: t('block.form.trigger-label'),
                component: ({ open, onOpenChange }) => (
                  <BlockForm
                    address={row.original.asset.id}
                    assettype={row.original.asset.type}
                    account={row.original.account.id}
                    open={open}
                    onOpenChange={onOpenChange}
                  />
                ),
              },
              {
                id: 'freeze-form',
                label: t('freeze.trigger-label'),
                component: ({ open, onOpenChange }) => (
                  <FreezeForm
                    address={row.original.asset.id}
                    userAddress={row.original.account.id}
                    balance={row.original.value}
                    frozen={row.original.frozen}
                    symbol={row.original.asset.symbol}
                    open={open}
                    onOpenChange={onOpenChange}
                  />
                ),
              },
              {
                id: 'mint-form',
                label: t('mint.trigger-label'),
                component: ({ open, onOpenChange }) => (
                  <MintForm
                    address={row.original.asset.id}
                    recipient={row.original.account.id}
                    assettype={row.original.asset.type}
                    open={open}
                    onOpenChange={onOpenChange}
                  />
                ),
              },
            ]}
          />
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
