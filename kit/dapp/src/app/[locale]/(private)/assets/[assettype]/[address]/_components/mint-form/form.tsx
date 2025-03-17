'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { mint } from '@/lib/mutations/mint/mint-action';
import { MintSchema } from '@/lib/mutations/mint/mint-schema';
import type { AssetType } from '@/lib/utils/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Amount } from './steps/amount';
import { Recipients } from './steps/recipients';
import { Summary } from './steps/summary';

interface MintFormProps {
  address: Address;
  assettype: AssetType;
  recipient?: Address;
  asButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MintForm({
  address,
  assettype,
  recipient,
  asButton = false,
  open,
  onOpenChange,
}: MintFormProps) {
  const t = useTranslations('private.assets.details.forms.mint');
  const isExternallyControlled =
    open !== undefined && onOpenChange !== undefined;
  const [internalOpenState, setInternalOpenState] = useState(false);
  const steps = recipient
    ? [<Amount key="amount" />, <Summary key="summary" address={address} />]
    : [
        <Amount key="amount" />,
        <Recipients key="recipients" />,
        <Summary key="summary" address={address} />,
      ];
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
        action={mint}
        resolver={zodResolver(MintSchema)}
        onOpenChange={
          isExternallyControlled ? onOpenChange : setInternalOpenState
        }
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
          assettype,
          to: recipient,
        }}
      >
        {steps.map((step) => step)}
      </Form>
    </FormSheet>
  );
}
