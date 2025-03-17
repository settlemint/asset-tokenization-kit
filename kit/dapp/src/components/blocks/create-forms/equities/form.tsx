'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { createEquity } from '@/lib/mutations/equity/create/create-action';
import { CreateEquitySchema } from '@/lib/mutations/equity/create/create-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';

interface CreateEquityFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateEquityForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateEquityFormProps) {
  const t = useTranslations('private.assets.create');
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);
  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t('form-title.equities')}
      description={t('form-description.equities')}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled ? undefined : t('form-trigger-label.equities')
      }
    >
      <Form
        action={createEquity}
        resolver={zodResolver(CreateEquitySchema)}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t('submit-button-label.equities'),
        }}
        defaultValues={{}}
        onAnyFieldChange={({ clearErrors }) => {
          clearErrors(['predictedAddress']);
        }}
      >
        <Basics />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
