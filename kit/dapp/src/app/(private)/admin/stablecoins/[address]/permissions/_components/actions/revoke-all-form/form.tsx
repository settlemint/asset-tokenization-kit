'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { useUpdateRoles } from '@/lib/mutations/stablecoin/update-roles';
import { useAssetDetail } from '@/lib/queries/asset/asset-detail';
import { useState } from 'react';
import type { Address } from 'viem';
import { Summary } from './steps/summary';

interface RevokeAllPermissionsFormProps {
  address: Address;
  account: Address;
}

export function RevokeAllPermissionsForm({
  address,
  account,
}: RevokeAllPermissionsFormProps) {
  const updateRolesMutation = useUpdateRoles();
  const { data: stablecoin } = useAssetDetail({ address });
  const user = useUser();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      triggerLabel="Revoke all permissions"
      title="Revoke all permissions"
      description="Revoke all permissions for a user"
    >
      <Form
        mutation={updateRolesMutation}
        buttonLabels={{
          label: 'Revoke all permissions',
        }}
        defaultValues={{
          address,
          from: user.wallet,
          userAddress: account,
          roles: {
            DEFAULT_ADMIN_ROLE: false,
            SUPPLY_MANAGEMENT_ROLE: false,
            USER_MANAGEMENT_ROLE: false,
          },
        }}
      >
        <Summary
          userAddress={user.wallet}
          currentRoles={
            stablecoin?.roles.find((p) => p.id === user.wallet)?.roles ?? []
          }
        />
      </Form>
    </FormSheet>
  );
}
