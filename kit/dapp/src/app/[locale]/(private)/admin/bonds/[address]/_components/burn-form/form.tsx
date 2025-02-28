'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { burn } from '@/lib/mutations/bond/burn/burn-action';
import { BurnSchema } from '@/lib/mutations/bond/burn/burn-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';

interface BurnFormProps {
  address: Address;
  balance: number;
}

export function BurnForm({ address, balance }: BurnFormProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('admin.bonds.burn-form');

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel={t('trigger-label')}
      title={t('title')}
      description={t('description')}
    >
      <Form
        action={burn}
        resolver={zodResolver(BurnSchema)}
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
        }}
      >
        <Amount maxBurnAmount={balance} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
