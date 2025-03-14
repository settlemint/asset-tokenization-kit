/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */

"use server";
import {
  BondRevokeRole,
  CryptoCurrencyRevokeRole,
  EquityRevokeRole,
  FundRevokeRole,
  getRevokeRoleAction,
  StableCoinRevokeRole,
} from "./revoke-role";

export const stablecoinRevokeRoleAction =
  getRevokeRoleAction(StableCoinRevokeRole);

export const bondRevokeRoleAction = getRevokeRoleAction(BondRevokeRole);

export const cryptoCurrencyRevokeRoleAction = getRevokeRoleAction(
  CryptoCurrencyRevokeRole
);

export const equityRevokeRoleAction = getRevokeRoleAction(EquityRevokeRole);

export const fundRevokeRoleAction = getRevokeRoleAction(FundRevokeRole);

export type RevokeRoleActionType =
  | typeof stablecoinRevokeRoleAction
  | typeof bondRevokeRoleAction
  | typeof cryptoCurrencyRevokeRoleAction
  | typeof equityRevokeRoleAction
  | typeof fundRevokeRoleAction;
