'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { mint } from '@/lib/mutations/bond/mint/mint-action';
import { MintSchema } from '@/lib/mutations/bond/mint/mint-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';

interface MintFormProps {
  address: Address;
}

export function MintForm({ address }: MintFormProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('admin.bonds.mint-form');

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel={t('trigger-label')}
      title={t('title')}
      description={t('description')}
    >
      <Form
        action={mint}
        resolver={zodResolver(MintSchema)}
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
        }}
      >
        <Amount />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
