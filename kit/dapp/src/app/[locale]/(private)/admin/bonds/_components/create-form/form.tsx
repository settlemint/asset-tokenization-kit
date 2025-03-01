'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { createBond } from '@/lib/mutations/bond/create/create-action';
import { CreateBondSchema } from '@/lib/mutations/bond/create/create-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';

interface CreateBondFormProps {
  open: boolean;
  onCloseAction: () => void;
}

export function CreateBondForm({ open, onCloseAction }: CreateBondFormProps) {
  const t = useTranslations('admin.bonds.create-form');

  return (
    <FormSheet
      open={open}
      onOpenChange={onCloseAction}
      title={t('title')}
      description={t('description')}
    >
      <Form
        action={createBond}
        resolver={zodResolver(CreateBondSchema)}
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
