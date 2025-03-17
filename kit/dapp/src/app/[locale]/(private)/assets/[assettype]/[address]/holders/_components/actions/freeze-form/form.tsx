'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { freeze } from '@/lib/mutations/freeze/freeze-action';
import { FreezeSchema } from '@/lib/mutations/freeze/freeze-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Summary } from './steps/summary';

interface FreezeFormProps {
  address: Address;
  userAddress: Address;
  balance: string | number;
  frozen: string | number;
  symbol: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FreezeForm({
  address,
  userAddress,
  balance,
  frozen,
  symbol,
  open,
  onOpenChange,
}: FreezeFormProps) {
  const t = useTranslations('private.assets.details.holders.forms.freeze');

  // Convert to numbers for component use
  const balanceNum =
    typeof balance === 'string' ? Number.parseFloat(balance) : balance;
  const frozenNum =
    typeof frozen === 'string' ? Number.parseFloat(frozen) : frozen;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t('trigger-label')}
      title={t('title')}
      description={t('description')}
    >
      <Form
        action={freeze}
        resolver={zodResolver(FreezeSchema)}
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
          userAddress,
          amount: 0,
        }}
      >
        <Amount balance={balanceNum} frozen={frozenNum} symbol={symbol} />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
