'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { useBlockUser } from '@/lib/mutations/stablecoin/block-user';
import { useUnblockUser } from '@/lib/mutations/stablecoin/unblock-user';
import { useAssetBalanceDetail } from '@/lib/queries/asset-balance/asset-balance-detail';
import { useState } from 'react';
import type { Address } from 'viem';
import { Summary } from './steps/summary';

interface BlockFormProps {
  address: Address;
  account: Address;
}

export function BlockForm({ address, account }: BlockFormProps) {
  const unblockMutation = useUnblockUser();
  const blockMutation = useBlockUser();
  const balance = useAssetBalanceDetail({ address, account });
  const user = useUser();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  if (balance?.blocked) {
    return (
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        triggerLabel="Unpause"
        title="Unpause"
        description="Unpause a stablecoin"
      >
        <Form
          mutation={unblockMutation}
          buttonLabels={{
            label: 'Unblock',
          }}
          defaultValues={{
            address,
            from: user.wallet,
          }}
        >
          <Summary address={address} isCurrentlyBlocked={balance.blocked} />
        </Form>
      </FormSheet>
    );
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel="Pause"
      title="Pause"
      description="Pause a stablecoin"
    >
      <Form
        mutation={blockMutation}
        buttonLabels={{
          label: 'Block',
        }}
        defaultValues={{
          address,
          from: user.wallet,
        }}
      >
        <Summary
          address={address}
          isCurrentlyBlocked={balance.blocked ?? false}
        />
      </Form>
    </FormSheet>
  );
}
