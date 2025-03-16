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
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UpdateCollateralForm({
  address,
  asButton = false,
  open,
  onOpenChange,
}: UpdateCollateralFormProps) {
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);
  const t = useTranslations('private.assets.details.forms.update-collateral');

  return (
    <FormSheet
      open={isExternallyControlled ? open : internalOpenState}
      onOpenChange={
        isExternallyControlled ? onOpenChange : setInternalOpenState
      }
      title={t('title')}
      triggerLabel={isExternallyControlled ? undefined : t('trigger-label')}
      description={t('description')}
      asButton={asButton}
    >
      <Form
        action={updateCollateral}
        resolver={zodResolver(UpdateCollateralSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
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
