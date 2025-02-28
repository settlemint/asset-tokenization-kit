'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import type { Role } from '@/lib/config/roles';
import { revokeAllRoles } from '@/lib/mutations/stablecoin/revoke-all-roles/revoke-all-roles-action';
import { RevokeAllRolesSchema } from '@/lib/mutations/stablecoin/revoke-all-roles/revoke-all-roles-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { Summary } from './steps/summary';

interface RevokeAllPermissionsFormProps {
  address: Address;
  account: Address;
  currentRoles: Role[];
}

export function RevokeAllPermissionsForm({
  address,
  account,
  currentRoles,
}: RevokeAllPermissionsFormProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('admin.stablecoins.permissions.revoke-all-form');

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel={t('trigger-label')}
      title={t('title')}
      description={t('description')}
    >
      <Form
        action={revokeAllRoles}
        resolver={zodResolver(RevokeAllRolesSchema)}
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
          userAddress: account,
        }}
      >
        <Summary userAddress={account} currentRoles={currentRoles} />
      </Form>
    </FormSheet>
  );
}
