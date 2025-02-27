'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { PercentageProgressBar } from '@/components/blocks/percentage-progress/percentage-progress';
import type {
  OffchainStableCoin,
  StableCoin,
} from '@/lib/queries/stablecoin/stablecoin-fragment';
import { useStableCoinList } from '@/lib/queries/stablecoin/stablecoin-list';
import { formatNumber } from '@/lib/utils/number';
import { createColumnHelper } from '@tanstack/react-table';
import type bigDecimal from 'js-big-decimal';
import { Lock, PauseCircle, PlayCircle, Unlock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ComponentType } from 'react';

const columnHelper = createColumnHelper<
  StableCoin &
    OffchainStableCoin & {
      collateralCommittedRatio: number | bigDecimal;
    }
>();

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  active: PlayCircle,
  paused: PauseCircle,
  private: Lock,
  public: Unlock,
};

export function StableCoinTable() {
  const { data: stablecoins } = useStableCoinList();
  const t = useTranslations('admin.stablecoins.table');

  return (
    <DataTable
      columns={[
        columnHelper.accessor('id', {
          header: t('address-header'),
          cell: ({ getValue }) => (
            <EvmAddress address={getValue()} prettyNames={false}>
              <EvmAddressBalances address={getValue()} />
            </EvmAddress>
          ),
          enableColumnFilter: false,
        }),
        columnHelper.accessor('name', {
          header: t('name-header'),
          cell: ({ getValue }) => getValue(),
          enableColumnFilter: false,
        }),
        columnHelper.accessor('symbol', {
          header: t('symbol-header'),
          cell: ({ getValue }) => getValue(),
          enableColumnFilter: false,
        }),
        columnHelper.accessor('totalSupply', {
          header: t('total-supply-header'),
          meta: {
            variant: 'numeric',
          },
          cell: ({ getValue }) => formatNumber(getValue()),
          enableColumnFilter: false,
        }),
        columnHelper.accessor('collateralCommittedRatio', {
          header: t('committed-collateral-header'),
          cell: ({ getValue }) => {
            return <PercentageProgressBar percentage={getValue()} />;
          },
          enableColumnFilter: false,
        }),
        columnHelper.accessor('paused', {
          header: t('status-header'),
          cell: ({ getValue }) => {
            const paused: boolean = getValue();
            const Icon = icons[paused ? 'paused' : 'active'];
            return (
              <>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                <span>{paused ? t('paused-status') : t('active-status')}</span>
              </>
            );
          },
        }),
        columnHelper.accessor('private', {
          header: t('private-header'),
          cell: ({ getValue }) => {
            const privateAsset: boolean = !!getValue();
            const Icon = icons[privateAsset ? 'private' : 'public'];
            return (
              <>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                <span>
                  {privateAsset ? t('private-status') : t('public-status')}
                </span>
              </>
            );
          },
        }),
        columnHelper.display({
          id: 'actions',
          header: t('actions-header'),
          cell: ({ row }) => {
            return (
              <DataTableRowActions
                detailUrl={`/admin/stablecoins/${row.original.id}`}
              />
            );
          },
          meta: {
            enableCsvExport: false,
          },
        }),
      ]}
      data={stablecoins}
      icons={icons}
      name={t('stablecoin')}
    />
  );
}
