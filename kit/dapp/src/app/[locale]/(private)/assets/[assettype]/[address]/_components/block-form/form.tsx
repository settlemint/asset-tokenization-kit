'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { blockUser } from '@/lib/mutations/block-user/block-user-action';
import { BlockUserSchema } from '@/lib/mutations/block-user/block-user-schema';
import type { AssetType } from '@/lib/utils/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';
import { Account } from './steps/account';
import { Summary } from './steps/summary';

interface BlockFormProps {
  address: Address;
  assettype: AssetType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Address;
}

export function BlockForm({
  address,
  assettype,
  account,
  open,
  onOpenChange,
}: BlockFormProps) {
  const t = useTranslations('private.assets.details.forms.block.form');
  const steps = account
    ? [<Summary key="summary" />]
    : [<Account key="account" />, <Summary key="summary" />];

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t('trigger-label')}
      title={t('title')}
      description={t('description')}
    >
      <Form
        action={blockUser}
        resolver={zodResolver(BlockUserSchema)}
        buttonLabels={{
          label: t('trigger-label'),
        }}
        onOpenChange={onOpenChange}
        defaultValues={{
          address,
          account,
          assettype,
        }}
      >
        {steps.map((step) => step)}
      </Form>
    </FormSheet>
  );
}
