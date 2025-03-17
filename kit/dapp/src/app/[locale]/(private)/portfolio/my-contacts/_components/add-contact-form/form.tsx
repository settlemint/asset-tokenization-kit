'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { addContact } from '@/lib/mutations/contact/add-contact-action';
import { getAddContactFormSchema } from '@/lib/mutations/contact/add-contact-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Contact } from './steps/contact';

export function AddContactForm({
  open,
  onCloseAction,
}: {
  open: boolean;
  onCloseAction: () => void;
}) {
  const t = useTranslations('portfolio.add-contact-form');

  return (
    <FormSheet
      open={open}
      onOpenChange={onCloseAction}
      title={t('contact.title')}
      description={t('contact.description')}
    >
      <Form
        action={addContact}
        resolver={zodResolver(getAddContactFormSchema())}
        onOpenChange={onCloseAction}
        buttonLabels={{
          label: t('contact.title'),
        }}
        secureForm={false}
        toastMessages={{
          loading: t('contact.adding'),
          success: t('contact.added'),
        }}
      >
        <Contact />
      </Form>
    </FormSheet>
  );
}
