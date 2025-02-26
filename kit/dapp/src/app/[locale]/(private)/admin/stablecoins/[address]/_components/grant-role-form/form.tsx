'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { useGrantRole } from '@/lib/mutations/stablecoin/grant-role';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Address } from 'viem';
import { AdminAddress } from './steps/address';
import { AdminRoles } from './steps/roles';
import { Summary } from './steps/summary';

interface GrantRoleFormProps {
  address: Address;
}

export function GrantRoleForm({ address }: GrantRoleFormProps) {
  const grantRole = useGrantRole();
  const user = useUser();
  const [open, setOpen] = useState(false);
  const t = useTranslations('admin.stablecoins.grant-role-form');

  if (!user) {
    return null;
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel={t('trigger-label')}
      title={t('title')}
      description={t('description')}
    >
      <Form
        mutation={grantRole}
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
          from: user.wallet,
          roles: {
            DEFAULT_ADMIN_ROLE: false,
            SUPPLY_MANAGEMENT_ROLE: false,
            USER_MANAGEMENT_ROLE: false,
          },
        }}
      >
        <AdminAddress />
        <AdminRoles />
        <Summary address={address} />
      </Form>
    </FormSheet>
  );
}
