'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import type { DataTableRowAction } from '@/components/blocks/data-table/data-table';
import { useState } from 'react';
import type { Address } from 'viem';
import { ActionSheet } from './action-sheet';
import { BlockHolderButton } from './block-form/button';
import { BlockHolderForm } from './block-form/form';
import type { StablecoinBalance } from './data';
import { columns } from './holders-columns';

type HoldersTableProps = {
  id: string;
  balances: StablecoinBalance[];
};

type HolderAction = { type: 'block'; holder: Address; blocked: boolean };
// Add more action types here as needed

export function HoldersTable({ id, balances }: HoldersTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [activeAction, setActiveAction] = useState<HolderAction | null>(null);

  console.log('activeAction', activeAction);
  console.log('showForm', showForm);

  const renderActionForm = (action: HolderAction) => {
    switch (action.type) {
      case 'block':
        return (
          <ActionSheet open={showForm} onOpenChange={setShowForm}>
            <BlockHolderForm
              address={id}
              holder={action.holder}
              blocked={action.blocked}
              onCloseAction={() => {
                setShowForm(false);
                setActiveAction(null);
              }}
            />
          </ActionSheet>
        );
      default: {
        const _exhaustiveCheck: never = action;
        return _exhaustiveCheck;
      }
    }
  };

  const holdersTableActions: DataTableRowAction<StablecoinBalance>[] = [
    {
      label: 'Block',
      component: (row) => (
        <BlockHolderButton
          holder={row.account.id}
          blocked={row.blocked}
          onClick={(e) => {
            e.stopPropagation();
            setActiveAction({
              type: 'block',
              holder: row.account.id,
              blocked: row.blocked,
            });
            setShowForm(true);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={balances} name="Holders" rowActions={holdersTableActions} />

      {showForm && activeAction && renderActionForm(activeAction)}
    </>
  );
}
