/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */

'use server';
import {
  BondRevokeRole,
  CryptoCurrencyRevokeRole,
  EquityRevokeRole,
  FundRevokeRole,
  StableCoinRevokeRole,
  TokenizedDepositRevokeRole,
  getRevokeRoleAction,
} from './revoke-role';

export const stableCoinRevokeRoleAction =
  getRevokeRoleAction(StableCoinRevokeRole);

export const bondRevokeRoleAction = getRevokeRoleAction(BondRevokeRole);

export const cryptoCurrencyRevokeRoleAction = getRevokeRoleAction(
  CryptoCurrencyRevokeRole
);

export const equityRevokeRoleAction = getRevokeRoleAction(EquityRevokeRole);

export const fundRevokeRoleAction = getRevokeRoleAction(FundRevokeRole);

export const tokenizedDepositRevokeRoleAction = getRevokeRoleAction(
  TokenizedDepositRevokeRole
);

export type RevokeRoleActionType =
  | typeof stableCoinRevokeRoleAction
  | typeof bondRevokeRoleAction
  | typeof cryptoCurrencyRevokeRoleAction
  | typeof equityRevokeRoleAction
  | typeof fundRevokeRoleAction
  | typeof tokenizedDepositRevokeRoleAction;
