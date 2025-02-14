'use client';

import type { DataTableRowAction } from '@/components/blocks/data-table/data-table';
import { DataTable } from '@/components/blocks/data-table/data-table';
import { useState } from 'react';
import type { Address } from 'viem';
import { BlockHolderActionSheet } from './block-form/action-sheet';
import { BlockHolderForm } from './block-form/form';
import type { FundHoldersBalance } from './data';
import { columns } from './holders-columns';

type HoldersTableProps = {
  id: `0x${string}`;
  balances: FundHoldersBalance[];
};

type HolderAction = { type: 'block'; holder: Address; blocked: boolean };
// Add more action types here as needed

export function HoldersTable({ id, balances }: HoldersTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [activeAction, setActiveAction] = useState<HolderAction | null>(null);

  const renderActionForm = (action: HolderAction) => {
    switch (action.type) {
      case 'block':
        return (
          <BlockHolderActionSheet open={showForm} onOpenChange={setShowForm}>
            <BlockHolderForm
              address={id}
              holder={action.holder}
              blocked={false} // TODO: replace with the actual blocked state
              onCloseAction={() => {
                setShowForm(false);
                setActiveAction(null);
              }}
            />
          </BlockHolderActionSheet>
        );
      default:
        return null;
    }
  };

  const holdersTableActions: DataTableRowAction<FundHoldersBalance>[] = [
    // TODO: add action back in https://linear.app/settlemint/issue/ENG-2357/fund-block-and-unblock-user-user-actions
    // {
    //   label: (row) => (row.blocked ? 'Unblock' : 'Block'),
    //   component: (row) => (
    //     <BlockHolderButton
    //       holder={row.account.id}
    //       blocked={row.blocked}
    //       onClick={(e) => {
    //         e.stopPropagation();
    //         setActiveAction({
    //           type: 'block',
    //           holder: row.account.id,
    //           blocked: row.blocked,
    //         });
    //         setShowForm(true);
    //       }}
    //     />
    //   ),
    // },
  ];

  return (
    <>
      <DataTable columns={columns} data={balances} name="Holders" rowActions={holdersTableActions} />

      {showForm && activeAction && renderActionForm(activeAction)}
    </>
  );
}
