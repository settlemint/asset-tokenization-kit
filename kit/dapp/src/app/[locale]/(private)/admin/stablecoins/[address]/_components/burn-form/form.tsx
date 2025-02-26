'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { useBurn } from '@/lib/mutations/stablecoin/burn';
import { useAssetBalanceDetail } from '@/lib/queries/asset-balance/asset-balance-detail';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';

interface BurnFormProps {
  address: Address;
}

export function BurnForm({ address }: BurnFormProps) {
  const burn = useBurn();
  const user = useUser();
  const [open, setOpen] = useState(false);
  const t = useTranslations('admin.stablecoins.burn-form');
  const balance = useAssetBalanceDetail({
    address,
    account: user?.wallet,
  });

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
        mutation={burn}
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
          from: user.wallet,
        }}
      >
        <Amount balance={Number(balance?.value ?? 0)} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
