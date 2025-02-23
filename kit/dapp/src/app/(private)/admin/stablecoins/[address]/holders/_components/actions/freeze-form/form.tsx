'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { useFreeze } from '@/lib/mutations/stablecoin/freeze';
import { useAssetBalanceDetail } from '@/lib/queries/asset-balance/asset-balance-detail';
import { useState } from 'react';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';

interface FreezeFormProps {
  address: Address;
  account: Address;
}

export function FreezeForm({ address, account }: FreezeFormProps) {
  const freezeMutation = useFreeze();
  const balance = useAssetBalanceDetail({ address, account });
  const user = useUser();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
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
        mutation={freezeMutation}
        buttonLabels={{
          label: 'Freeze',
        }}
        defaultValues={{
          address,
          from: user.wallet,
          amount: 0,
        }}
      >
        <Amount
          balance={Number(balance.value) ?? 0}
          frozen={Number(balance.frozen) ?? 0}
          symbol={balance.asset?.symbol ?? ''}
        />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
