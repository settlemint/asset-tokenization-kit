'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { createEquity } from '@/lib/mutations/equity/create/create-action';
import { CreateEquitySchema } from '@/lib/mutations/equity/create/create-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';

interface CreateEquityFormProps {
  open: boolean;
  onCloseAction: () => void;
}

export function CreateEquityForm({
  open,
  onCloseAction,
}: CreateEquityFormProps) {
  const t = useTranslations('admin.equities.create-form');

  return (
    <FormSheet
      open={open}
      onOpenChange={onCloseAction}
      title={t('title')}
      description={t('description')}
    >
      <Form
        action={createEquity}
        resolver={zodResolver(CreateEquitySchema)}
        onOpenChange={onCloseAction}
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{}}
      >
        <Basics />
        <Configuration />
        <Summary />
      </Form>
    </FormSheet>
  );
}
