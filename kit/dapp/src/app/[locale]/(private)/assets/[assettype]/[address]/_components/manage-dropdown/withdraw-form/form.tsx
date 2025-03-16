'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { withdrawUnderlyingAsset } from '@/lib/mutations/bond/withdraw/withdraw-action';
import { WithdrawSchema } from '@/lib/mutations/bond/withdraw/withdraw-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Recipient } from './steps/recipient';
import { Summary } from './steps/summary';

interface WithdrawFormProps {
  address: Address;
  underlyingAssetAddress: Address;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WithdrawForm({
  address,
  underlyingAssetAddress,
  asButton = false,
  open,
  onOpenChange,
}: WithdrawFormProps) {
  const t = useTranslations('private.assets.details.forms.withdraw');
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      triggerLabel={isExternallyControlled ? undefined : t('trigger-label')}
      title={t('title')}
      description={t('description')}
      asButton={asButton}
    >
      <Form
        action={withdrawUnderlyingAsset}
        resolver={zodResolver(WithdrawSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
          underlyingAssetAddress,
        }}
      >
        <Recipient />
        <Amount />
        <Summary />
      </Form>
    </FormSheet>
  );
}
