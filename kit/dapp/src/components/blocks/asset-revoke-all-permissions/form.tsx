'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import type { Role } from '@/lib/config/roles';
import { bondRevokeRoleAction, cryptoCurrencyRevokeRoleAction, equityRevokeRoleAction, fundRevokeRoleAction, stableCoinRevokeRoleAction, tokenizedDepositRevokeRoleAction, type RevokeRoleActionType } from '@/lib/mutations/asset/access-control/revoke-role/revoke-role-action';
import { RevokeRoleSchema } from '@/lib/mutations/asset/access-control/revoke-role/revoke-role-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';
import { Summary } from './steps/summary';
import type { AssetType } from '@/app/[locale]/(private)/assets/[assettype]/types';

export interface RevokeAllPermissionsFormProps {
  address: Address;
  account: Address;
  currentRoles: Role[];
  assettype: AssetType;
}

interface RevokeAllPermissionsFormPropsWithOpen
  extends RevokeAllPermissionsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RevokeAllPermissionsForm({
  address,
  account,
  currentRoles,
  open,
  onOpenChange,
  assettype,
}: RevokeAllPermissionsFormPropsWithOpen) {
  const t = useTranslations(
    'private.assets.details.permissions.revoke-all-form'
  );

  const getRevokeRoleAction = (assettype: AssetType) => {
    switch (assettype) {
      case 'bonds':
        return bondRevokeRoleAction;
      case 'equities':
        return equityRevokeRoleAction;
      case 'funds':
        return fundRevokeRoleAction;
      case 'tokenizeddeposits':
        return tokenizedDepositRevokeRoleAction;
      case 'cryptocurrencies':
        return cryptoCurrencyRevokeRoleAction;
      case 'stablecoins':
        return stableCoinRevokeRoleAction;
      default:
        throw new Error(`Invalid asset type: ${assettype}`);
    }
  };
  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      triggerLabel={t('trigger-label')}
      title={t('title')}
      description={t('description')}
    >
      <Form
        action={getRevokeRoleAction(assettype)}
        resolver={zodResolver(RevokeRoleSchema)}
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
        <Summary userAddress={account} currentRoles={currentRoles} />
      </Form>
    </FormSheet>
  );
}
