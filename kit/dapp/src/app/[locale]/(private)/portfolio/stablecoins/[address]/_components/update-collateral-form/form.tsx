'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { useUpdateCollateral } from '@/lib/mutations/stablecoin/update-collateral';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('admin.stablecoins.update-collateral-form');

  if (!user) {
    return null;
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel={t('trigger-label')}
      title={t('title')}
      description={t('description')}
    >
      <Form
        mutation={mutation}
        buttonLabels={{
          label: t('button-label'),
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
