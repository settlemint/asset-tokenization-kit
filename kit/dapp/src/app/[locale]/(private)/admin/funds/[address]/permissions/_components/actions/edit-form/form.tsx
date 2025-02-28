'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import type { Role } from '@/lib/config/roles';
import { updateRoles } from '@/lib/mutations/stablecoin/update-roles/update-roles-action';
import { UpdateRolesSchema } from '@/lib/mutations/stablecoin/update-roles/update-roles-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Roles } from './steps/roles';
import { Summary } from './steps/summary';

interface EditPermissionsFormProps {
  address: Address;
  account: Address;
  currentRoles: Role[];
}

export function EditPermissionsForm({
  address,
  account,
  currentRoles,
}: EditPermissionsFormProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('admin.stablecoins.permissions.edit-form');

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel={t('trigger-label')}
      title={t('title')}
      description={t('description')}
    >
      <Form
        action={updateRoles}
        resolver={zodResolver(UpdateRolesSchema)}
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
          userAddress: account,
        }}
      >
        <Roles />
        <Summary userAddress={account} currentRoles={currentRoles} />
      </Form>
    </FormSheet>
  );
}
