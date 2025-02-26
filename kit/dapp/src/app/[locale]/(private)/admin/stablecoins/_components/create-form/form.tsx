'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { useCreateStablecoin } from '@/lib/mutations/stablecoin/create';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';

interface CreateStablecoinFormProps {
  open: boolean;
  onCloseAction: () => void;
}

export function CreateStablecoinForm({
  open,
  onCloseAction,
}: CreateStablecoinFormProps) {
  const createStablecoin = useCreateStablecoin();
  const user = useUser();

  if (!user) {
    return null;
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={() => {
        onCloseAction();
      }}
      triggerLabel="Create Stablecoin"
      title="Create Stablecoin"
      description="Create a stablecoin"
    >
      <Form
        mutation={createStablecoin}
        buttonLabels={{
          label: 'Create Stablecoin',
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
