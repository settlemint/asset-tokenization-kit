'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { createStablecoin } from '@/lib/mutations/stablecoin/create/create-action';
import { CreateStablecoinSchema } from '@/lib/mutations/stablecoin/create/create-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Basics } from './steps/basics';
import { Configuration } from './steps/configuration';
import { Summary } from './steps/summary';

interface CreateStablecoinFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asButton?: boolean;
}

export function CreateStablecoinForm({
  open,
  onOpenChange,
  asButton = false,
}: CreateStablecoinFormProps) {
  const t = useTranslations('private.assets.create');
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [localOpen, setLocalOpen] = useState(false);

  return (
    <FormSheet
      open={open ?? localOpen}
      onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
      title={t('form-title.stablecoins')}
      description={t('form-description.stablecoins')}
      asButton={asButton}
      triggerLabel={
        isExternallyControlled ? undefined : t('form-trigger-label.stablecoins')
      }
    >
      <Form
        action={createStablecoin}
        resolver={zodResolver(CreateStablecoinSchema)}
        onOpenChange={isExternallyControlled ? onOpenChange : setLocalOpen}
        buttonLabels={{
          label: t('submit-button-label.stablecoins'),
        }}
        defaultValues={{
          collateralLivenessSeconds: 3600 * 24 * 365,
        }}
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
