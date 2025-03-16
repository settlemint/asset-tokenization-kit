/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */

'use server';

import {
  BondGrantRole,
  CryptoCurrencyGrantRole,
  EquityGrantRole,
  FundGrantRole,
  StableCoinGrantRole,
} from '../grant-role/grant-role';
import {
  BondRevokeRole,
  CryptoCurrencyRevokeRole,
  EquityRevokeRole,
  FundRevokeRole,
  StableCoinRevokeRole,
} from '../revoke-role/revoke-role';
import { getUpdateRolesAction } from './update-roles';

export const stableCoinUpdatePermissionsAction = getUpdateRolesAction({
  grantRoleMutation: StableCoinGrantRole,
  revokeRoleMutation: StableCoinRevokeRole,
});

export const bondUpdatePermissionsAction = getUpdateRolesAction({
  grantRoleMutation: BondGrantRole,
  revokeRoleMutation: BondRevokeRole,
});

export const cryptoCurrencyUpdatePermissionsAction = getUpdateRolesAction({
  grantRoleMutation: CryptoCurrencyGrantRole,
  revokeRoleMutation: CryptoCurrencyRevokeRole,
});

export const fundUpdatePermissionsAction = getUpdateRolesAction({
  grantRoleMutation: FundGrantRole,
  revokeRoleMutation: FundRevokeRole,
});

export const equityUpdatePermissionsAction = getUpdateRolesAction({
  grantRoleMutation: EquityGrantRole,
  revokeRoleMutation: EquityRevokeRole,
});

export type UpdateRolesActionType =
  | typeof stableCoinUpdatePermissionsAction
  | typeof bondUpdatePermissionsAction
  | typeof cryptoCurrencyUpdatePermissionsAction
  | typeof fundUpdatePermissionsAction
  | typeof equityUpdatePermissionsAction;
