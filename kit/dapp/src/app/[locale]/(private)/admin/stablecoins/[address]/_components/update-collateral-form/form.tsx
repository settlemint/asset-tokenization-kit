'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { updateCollateral } from '@/lib/mutations/stablecoin/update-collateral/update-collateral-action';
import { UpdateCollateralSchema } from '@/lib/mutations/stablecoin/update-collateral/update-collateral-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';

interface UpdateCollateralFormProps {
  address: Address;
}

export function UpdateCollateralForm({ address }: UpdateCollateralFormProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('admin.stablecoins.update-collateral-form');

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel={t('trigger-label')}
      title={t('title')}
      description={t('description')}
    >
      <Form
        action={updateCollateral}
        resolver={zodResolver(UpdateCollateralSchema)}
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
