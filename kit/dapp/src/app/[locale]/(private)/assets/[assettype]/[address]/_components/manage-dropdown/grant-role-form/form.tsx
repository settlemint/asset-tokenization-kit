'use client';

import { Form } from '@/components/blocks/form/form';
import { FormSheet } from '@/components/blocks/form/form-sheet';
import { bondGrantRoleAction, cryptoCurrencyGrantRoleAction, equityGrantRoleAction, fundGrantRoleAction, stablecoinGrantRoleAction, tokenizedDepositGrantRoleAction, type GrantRoleActionType } from '@/lib/mutations/asset/access-control/grant-role/grant-role-action';
import { GrantRoleSchema } from '@/lib/mutations/asset/access-control/grant-role/grant-role-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';
import { AdminAddress } from './steps/address';
import { AdminRoles } from './steps/roles';
import { Summary } from './steps/summary';
import type { AssetType } from '../../../../types';

interface GrantRoleFormProps {
  address: Address;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assettype: AssetType;
}

export function GrantRoleForm({
  address,
  open,
  onOpenChange,
  assettype,
}: GrantRoleFormProps) {
  const t = useTranslations('private.assets.details.forms.grant-role');
  const getGrantRoleAction = (assettype: AssetType) => {
    switch (assettype) {
      case 'bonds':
        return bondGrantRoleAction;
      case 'equities':
        return equityGrantRoleAction;
      case 'funds':
        return fundGrantRoleAction;
      case 'tokenizeddeposits':
        return tokenizedDepositGrantRoleAction;
      case 'cryptocurrencies':
        return cryptoCurrencyGrantRoleAction;
      case 'stablecoins':
        return stablecoinGrantRoleAction;
      default:
        throw new Error(`Invalid asset type: ${assettype}`);
    }
  };
  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('title')}
      description={t('description')}
    >
      <Form
        action={getGrantRoleAction(assettype)}
        resolver={zodResolver(GrantRoleSchema)}
        onOpenChange={onOpenChange}
        buttonLabels={{
          label: t('button-label'),
        }}
        defaultValues={{
          address,
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
