'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { redeem } from '@/lib/mutations/bond/redeem/redeem-action';
import { RedeemBondSchema } from '@/lib/mutations/bond/redeem/redeem-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';

interface RedeemFormProps {
  address: Address;
  balance: number;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RedeemForm({
  address,
  balance,
  asButton = false,
  open,
  onOpenChange,
}: RedeemFormProps) {
  const t = useTranslations('portfolio.my-assets.bond');
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={
        isExternallyControlled ? undefined : t('redeem-form.trigger-label')
      }
      title={t('redeem-form.title')}
      description={t('redeem-form.description')}
      asButton={asButton}
    >
      <Form
        action={redeem}
        resolver={zodResolver(RedeemBondSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t('redeem-form.button-label'),
        }}
        defaultValues={{
          address,
        }}
      >
        <Amount balance={balance} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
