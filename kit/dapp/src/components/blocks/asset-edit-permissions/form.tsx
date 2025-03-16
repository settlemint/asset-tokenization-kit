'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import type { Role } from '@/lib/config/roles';
import { UpdateRolesSchema } from '@/lib/mutations/asset/access-control/update-role/update-role-schema';
import { bondUpdatePermissionsAction, cryptoCurrencyUpdatePermissionsAction, equityUpdatePermissionsAction, fundUpdatePermissionsAction, stableCoinUpdatePermissionsAction, tokenizedDepositUpdatePermissionsAction, type UpdateRolesActionType } from '@/lib/mutations/asset/access-control/update-role/update-roles-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';
import { EvmAddress } from '../evm-address/evm-address';
import { Roles } from './steps/roles';
import { Summary } from './steps/summary';
import type { AssetType } from '@/app/[locale]/(private)/assets/[assettype]/types';

export interface EditPermissionsFormProps {
  address: Address;
  account: Address;
  currentRoles: Role[];
  disableEditAdminRole: boolean;
  assetName: string;
  assettype: AssetType;
}

interface EditPermissionsFormPropsWithOpen extends EditPermissionsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPermissionsForm({
  address,
  account,
  currentRoles,
  disableEditAdminRole,
  assetName,
  open,
  onOpenChange,
  assettype,
}: EditPermissionsFormPropsWithOpen) {
  const t = useTranslations('private.assets.details.permissions.edit-form');

  const getUpdateRolesAction = (assettype: AssetType) => {
    switch (assettype) {
      case 'bonds':
        return bondUpdatePermissionsAction;
      case 'equities':
        return equityUpdatePermissionsAction;
      case 'funds':
        return fundUpdatePermissionsAction;
      case 'tokenizeddeposits':
        return tokenizedDepositUpdatePermissionsAction;
      case 'cryptocurrencies':
        return cryptoCurrencyUpdatePermissionsAction;
      case 'stablecoins':
        return stableCoinUpdatePermissionsAction;
      default:
        throw new Error(`Invalid asset type: ${assettype}`);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t('trigger-label')}
      title={<EvmAddress address={account} />}
      description={t('description', { name: assetName })}
    >
      <Form
        action={getUpdateRolesAction(assettype)}
        resolver={zodResolver(UpdateRolesSchema)}
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
          userAddress: account,
          roles: currentRoles.reduce(
            (acc, role) => {
              acc[role] = true;
              return acc;
            },
            {} as Record<Role, boolean>
          ),
        }}
      >
        <Roles disableEditAdminRole={disableEditAdminRole} />
        <Summary userAddress={account} currentRoles={currentRoles} />
      </Form>
    </FormSheet>
  );
}
