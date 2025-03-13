/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */

"use server";

import {
  BondGrantRole,
  CryptoCurrencyGrantRole,
  EquityGrantRole,
  FundGrantRole,
  StableCoinGrantRole,
} from "../grant-role/grant-role";
import {
  BondRevokeRole,
  CryptoCurrencyRevokeRole,
  EquityRevokeRole,
  FundRevokeRole,
  StableCoinRevokeRole,
} from "../revoke-role/revoke-role";
import { getUpdateRolesAction } from "./update-roles";

export const stableCoinUpdateAction = getUpdateRolesAction({
  grantRoleMutation: StableCoinGrantRole,
  revokeRoleMutation: StableCoinRevokeRole,
});

export const bondUpdateAction = getUpdateRolesAction({
  grantRoleMutation: BondGrantRole,
  revokeRoleMutation: BondRevokeRole,
});

export const cryptoCurrencyUpdateAction = getUpdateRolesAction({
  grantRoleMutation: CryptoCurrencyGrantRole,
  revokeRoleMutation: CryptoCurrencyRevokeRole,
});

export const fundUpdateAction = getUpdateRolesAction({
  grantRoleMutation: FundGrantRole,
  revokeRoleMutation: FundRevokeRole,
});

export const equityUpdateAction = getUpdateRolesAction({
  grantRoleMutation: EquityGrantRole,
  revokeRoleMutation: EquityRevokeRole,
});

export type UpdateRolesActionType =
  | typeof stableCoinUpdateAction
  | typeof bondUpdateAction
  | typeof cryptoCurrencyUpdateAction
  | typeof fundUpdateAction
  | typeof equityUpdateAction;
