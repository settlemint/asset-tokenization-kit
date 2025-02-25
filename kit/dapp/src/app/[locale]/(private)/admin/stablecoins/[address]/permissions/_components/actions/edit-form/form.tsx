'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { useUser } from '@/components/blocks/user-context/user-context';
import { useUpdateRoles } from '@/lib/mutations/stablecoin/update-roles';
import { useAssetDetail } from '@/lib/queries/asset/asset-detail';
import { useState } from 'react';
import type { Address } from 'viem';
import { Roles } from './steps/roles';
import { Summary } from './steps/summary';

interface EditPermissionsFormProps {
  address: Address;
  account: Address;
}

export function EditPermissionsForm({
  address,
  account,
}: EditPermissionsFormProps) {
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
      triggerLabel="Edit permissions"
      title="Edit permissions"
      description="Edit the permissions for a user"
    >
      <Form
        mutation={updateRolesMutation}
        buttonLabels={{
          label: 'Update',
        }}
        defaultValues={{
          address,
          from: user.wallet,
          userAddress: account,
        }}
      >
        <Roles />
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
