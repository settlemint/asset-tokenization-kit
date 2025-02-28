'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { pause } from '@/lib/mutations/funds/pause/pause-action';
import { PauseSchema } from '@/lib/mutations/funds/pause/pause-schema';
import { unpause } from '@/lib/mutations/funds/unpause/unpause-action';
import { UnpauseSchema } from '@/lib/mutations/funds/unpause/unpause-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Summary } from './steps/summary';

interface PauseFormProps {
  address: Address;
  isPaused: boolean;
}

export function PauseForm({ address, isPaused }: PauseFormProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('admin.funds.pause-form');

  if (isPaused) {
    return (
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        triggerLabel={t('unpause.trigger-label')}
        title={t('unpause.title')}
        description={t('unpause.description')}
      >
        <Form
          action={unpause}
          resolver={zodResolver(UnpauseSchema)}
          buttonLabels={{
            label: t('unpause.button-label'),
          }}
          defaultValues={{
            address,
          }}
        >
          <Summary address={address} isCurrentlyPaused={isPaused} />
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
        action={pause}
        resolver={zodResolver(PauseSchema)}
        buttonLabels={{
          label: t('pause.button-label'),
        }}
        defaultValues={{
          address,
        }}
      >
        <Summary address={address} isCurrentlyPaused={isPaused} />
      </Form>
    </FormSheet>
  );
}
