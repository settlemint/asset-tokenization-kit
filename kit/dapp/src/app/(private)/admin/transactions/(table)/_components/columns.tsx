'use client';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { createColumnHelper } from '@tanstack/react-table';
import { Lock, PauseCircle, PlayCircle, Unlock } from 'lucide-react';
import { Fragment } from 'react';
import { isAddress } from 'viem';
import type { NormalizedTransactionListItem } from './data';

const columnHelper = createColumnHelper<NormalizedTransactionListItem>();

export const columns = [
  columnHelper.accessor('timestamp', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Timestamp</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{getValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('asset', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Asset</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const asset = getValue();

      return (
        <DataTableColumnCell>
          <EvmAddress address={asset}>
            <EvmAddressBalances address={asset} />
          </EvmAddress>
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: true,
  }),
  columnHelper.accessor('event', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Event</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{getValue()}</DataTableColumnCell>,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('sender', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Sender</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const senderId = getValue();

      return (
        <DataTableColumnCell>
          <EvmAddress address={senderId}>
            <EvmAddressBalances address={senderId} />
          </EvmAddress>
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: true,
  }),
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: ({ row }) => (
      <DataTableColumnCell>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              Details
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{row.original.event}</SheetTitle>
              <Card>
                <CardContent className="pt-6">
                  <dl className="grid grid-cols-[1fr_2fr] gap-4">
                    <dt className="text-muted-foreground text-sm">Sender:</dt>
                    <dd className="text-sm">
                      <EvmAddress address={row.original.sender} />
                    </dd>
                    <dt className="text-muted-foreground text-sm">Asset:</dt>
                    <dd className="text-sm">
                      <EvmAddress address={row.original.asset} />
                    </dd>
                    <dt className="text-muted-foreground text-sm">Date:</dt>
                    <dd className="text-sm">{row.original.timestamp}</dd>
                  </dl>
                </CardContent>
              </Card>
              {Object.keys(row.original.details).length > 0 && (
                <>
                  <h2 className="font-semibold text-lg">Details</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <dl className="grid grid-cols-[1fr_2fr] gap-4">
                        {Object.entries(row.original.details).map(([key, value]) => (
                          <Fragment key={key}>
                            <dt className="text-muted-foreground text-sm capitalize">{key}:</dt>
                            <dd className="text-sm">{isAddress(value) ? <EvmAddress address={value} /> : value}</dd>
                          </Fragment>
                        ))}
                      </dl>
                    </CardContent>
                  </Card>
                </>
              )}
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </DataTableColumnCell>
    ),
    meta: {
      enableCsvExport: false,
    },
  }),
];

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
  private: Lock,
  public: Unlock,
};
