'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { usePause } from '@/lib/mutations/stablecoin/pause';
import { useUnPause } from '@/lib/mutations/stablecoin/unpause';
import { useStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('admin.stablecoins.pause-form');

  if (!user) {
    return null;
  }

  if (stableCoin?.paused) {
    return (
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        triggerLabel={t('unpause.trigger-label')}
        title={t('unpause.title')}
        description={t('unpause.description')}
      >
        <Form
          mutation={unPauseMutation}
          buttonLabels={{
            label: t('unpause.button-label'),
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
      triggerLabel={t('pause.trigger-label')}
      title={t('pause.title')}
      description={t('pause.description')}
    >
      <Form
        mutation={pauseMutation}
        buttonLabels={{
          label: t('pause.button-label'),
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
