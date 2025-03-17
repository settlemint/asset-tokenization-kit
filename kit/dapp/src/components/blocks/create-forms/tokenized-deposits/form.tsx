'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { createTokenizedDeposit } from '@/lib/mutations/tokenized-deposit/create/create-action';
import { CreateTokenizedDepositSchema } from '@/lib/mutations/tokenized-deposit/create/create-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';

interface CreateTokenizedDepositFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateTokenizedDepositForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateTokenizedDepositFormProps) {
  const t = useTranslations('private.assets.create');
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);

  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t('form-title.tokenizeddeposits')}
      description={t('form-description.tokenizeddeposits')}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled
          ? undefined
          : t('form-trigger-label.tokenizeddeposits')
      }
    >
      <Form
        action={createTokenizedDeposit}
        resolver={zodResolver(CreateTokenizedDepositSchema)}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t('submit-button-label.tokenizeddeposits'),
        }}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors(['predictedAddress']);
        }}
        defaultValues={{
          collateralLivenessSeconds: 3600 * 24 * 365,
        }}
      >
        <Basics />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
