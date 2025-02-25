'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { useUpdateCollateral } from '@/lib/mutations/stablecoin/update-collateral';
import { useState } from 'react';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';

interface UpdateCollateralFormProps {
  address: Address;
}

export function UpdateCollateralForm({ address }: UpdateCollateralFormProps) {
  const mutation = useUpdateCollateral();
  const user = useUser();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel="Update collateral"
      title="Update collateral"
      description="Update the collateral for a stablecoin"
    >
      <Form
        mutation={mutation}
        buttonLabels={{
          label: 'Update collateral',
        }}
        defaultValues={{
          address,
          from: user.wallet,
        }}
      >
        <Amount />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
