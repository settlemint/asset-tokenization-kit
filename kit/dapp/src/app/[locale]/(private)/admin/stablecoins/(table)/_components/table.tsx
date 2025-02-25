'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { PercentageProgressBar } from '@/components/blocks/percentage-progress/percentage-progress';
import { assetConfig } from '@/lib/config/assets';
import type {
  OffchainStableCoin,
  StableCoin,
} from '@/lib/queries/stablecoin/stablecoin-fragment';
import { useStableCoinList } from '@/lib/queries/stablecoin/stablecoin-list';
import { formatNumber } from '@/lib/utils/number';
import { createColumnHelper } from '@tanstack/react-table';
import type bigDecimal from 'js-big-decimal';
import { Lock, PauseCircle, PlayCircle, Unlock } from 'lucide-react';
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

  return (
    <DataTable
      columns={[
        columnHelper.accessor('id', {
          header: 'Address',
          cell: ({ getValue }) => (
            <EvmAddress address={getValue()} prettyNames={false}>
              <EvmAddressBalances address={getValue()} />
            </EvmAddress>
          ),
          enableColumnFilter: false,
        }),
        columnHelper.accessor('name', {
          header: 'Name',
          cell: ({ getValue }) => getValue(),
          enableColumnFilter: false,
        }),
        columnHelper.accessor('symbol', {
          header: 'Symbol',
          cell: ({ getValue }) => getValue(),
          enableColumnFilter: false,
        }),
        columnHelper.accessor('totalSupply', {
          header: 'Total Supply',
          meta: {
            variant: 'numeric',
          },
          cell: ({ getValue }) => formatNumber(getValue()),
          enableColumnFilter: false,
        }),
        columnHelper.accessor('collateralCommittedRatio', {
          header: 'Committed collateral',
          cell: ({ getValue }) => {
            return <PercentageProgressBar percentage={getValue()} />;
          },
          enableColumnFilter: false,
        }),
        columnHelper.accessor('paused', {
          header: 'Status',
          cell: ({ getValue }) => {
            const paused: boolean = getValue();
            const Icon = icons[paused ? 'paused' : 'active'];
            return (
              <>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                <span>{paused ? 'Paused' : 'Active'}</span>
              </>
            );
          },
        }),
        columnHelper.accessor('private', {
          header: 'Private',
          cell: ({ getValue }) => {
            const privateAsset: boolean = !!getValue();
            const Icon = icons[privateAsset ? 'private' : 'public'];
            return (
              <>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                <span>{privateAsset ? 'Private' : 'Public'}</span>
              </>
            );
          },
        }),
        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => {
            return (
              <DataTableRowActions
                detailUrl={`/admin/${assetConfig.stablecoin.urlSegment}/${row.original.id}`}
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
      name={assetConfig.stablecoin.name}
    />
  );
}
