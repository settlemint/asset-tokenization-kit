'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { useMint } from '@/lib/mutations/stablecoin/mint';
import { useStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';

interface MintFormProps {
  address: Address;
}

export function MintForm({ address }: MintFormProps) {
  const mint = useMint();
  const { data: stableCoin } = useStableCoinDetail({ address });
  const user = useUser();
  const [open, setOpen] = useState(false);
  const t = useTranslations('admin.stablecoins.mint-form');

  const collateralAvailable =
    Number(stableCoin?.collateral ?? 0) - Number(stableCoin?.totalSupply ?? 0);

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
        mutation={mint}
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
          from: user.wallet,
        }}
      >
        <Amount collateralAvailable={collateralAvailable} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
