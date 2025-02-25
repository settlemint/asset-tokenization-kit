'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { useCreateStablecoin } from '@/lib/mutations/stablecoin/create';
import { useState } from 'react';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';

interface CreateStablecoinFormProps {
  onCloseAction: () => void;
}

export function CreateStablecoinForm({
  onCloseAction,
}: CreateStablecoinFormProps) {
  const createStablecoin = useCreateStablecoin();
  const user = useUser();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={() => {
        setOpen(!open);
        onCloseAction();
      }}
      triggerLabel="Mint"
      title="Mint"
      description="Mint a stablecoin"
    >
      <Form
        mutation={createStablecoin}
        buttonLabels={{
          label: 'Pause',
        }}
        defaultValues={{
          from: user.wallet,
          collateralLivenessSeconds: 3600 * 24 * 365,
        }}
      >
        <Basics />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
