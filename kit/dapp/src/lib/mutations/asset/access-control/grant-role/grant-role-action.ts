/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */

'use server';

import {
  BondGrantRole,
  CryptoCurrencyGrantRole,
  EquityGrantRole,
  FundGrantRole,
  StableCoinGrantRole,
  TokenizedDepositGrantRole,
  getGrantRoleAction,
} from './grant-role';

export const stablecoinGrantRoleAction =
  getGrantRoleAction(StableCoinGrantRole);

export const bondGrantRoleAction = getGrantRoleAction(BondGrantRole);

export const cryptoCurrencyGrantRoleAction = getGrantRoleAction(
  CryptoCurrencyGrantRole
);

export const equityGrantRoleAction = getGrantRoleAction(EquityGrantRole);

export const fundGrantRoleAction = getGrantRoleAction(FundGrantRole);

export const tokenizedDepositGrantRoleAction = getGrantRoleAction(
  TokenizedDepositGrantRole
);

export type GrantRoleActionType =
  | typeof stablecoinGrantRoleAction
  | typeof bondGrantRoleAction
  | typeof cryptoCurrencyGrantRoleAction
  | typeof equityGrantRoleAction
  | typeof fundGrantRoleAction;
