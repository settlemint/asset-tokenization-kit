'use client';

import { AddContactForm } from '@/app/[locale]/(private)/portfolio/my-contacts/_components/add-contact-form/form';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function MyContactsActions() {
  const t = useTranslations('portfolio.my-contacts');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{t('add-contact-button')}</Button>
      <AddContactForm open={isOpen} onCloseAction={() => setIsOpen(false)} />
    </>
  );
}
