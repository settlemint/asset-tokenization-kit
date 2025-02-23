'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { usePause } from '@/lib/mutations/stablecoin/pause';
import { useUnPause } from '@/lib/mutations/stablecoin/unpause';
import { useStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { useState } from 'react';
import type { Address } from 'viem';
import { Summary } from './steps/summary';

interface PauseFormProps {
  address: Address;
}

export function PauseForm({ address }: PauseFormProps) {
  const unPauseMutation = useUnPause();
  const pauseMutation = usePause();
  const { data: stableCoin } = useStableCoinDetail({ address });
  const user = useUser();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  if (stableCoin?.paused) {
    return (
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        triggerLabel="Unpause"
        title="Unpause"
        description="Unpause a stablecoin"
      >
        <Form
          mutation={unPauseMutation}
          buttonLabels={{
            label: 'Unpause',
          }}
          defaultValues={{
            address,
            from: user.wallet,
          }}
        >
          <Summary address={address} isCurrentlyPaused={stableCoin.paused} />
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
        mutation={pauseMutation}
        buttonLabels={{
          label: 'Pause',
        }}
        defaultValues={{
          address,
          from: user.wallet,
        }}
      >
        <Summary address={address} isCurrentlyPaused={stableCoin.paused} />
      </Form>
    </FormSheet>
  );
}
