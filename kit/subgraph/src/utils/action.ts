import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Action } from "../../generated/schema";

export class ActionName {
  static ApproveXvPSettlement: string = "ApproveXvPSettlement";
  static ClaimXvPSettlement: string = "ClaimXvPSettlement";
}

export function actionId(
  actionName: string,
  target: Bytes,
  authorizedAccounts: Bytes[] | null,
  requiredRole: string | null
): Bytes {
  let idString = `${actionName}-${target.toHexString()}`;
  if (authorizedAccounts) {
    idString += `-${authorizedAccounts.join("-")}`;
  }
  if (requiredRole) {
    idString += `-${requiredRole}`;
  }
  return Bytes.fromUTF8(idString);
}

export function createAction(
  event: ethereum.Event,
  actionName: string,
  target: Bytes,
  type: string,
  activeAt: BigInt,
  expiresAt: BigInt | null,
  authorizationMethod: string,
  authorizedAccounts: Bytes[] | null,
  requiredRole: string | null
): Action {
  const id = actionId(actionName, target, authorizedAccounts, requiredRole);
  const action = new Action(id);

  action.name = actionName;
  action.type = type;
  action.target = target;
  action.createdAt = event.block.timestamp;
  action.activeAt = activeAt;
  action.expiresAt = expiresAt;
  action.executed = false;
  action.executedAt = null;
  action.executedBy = null;
  action.authorizationMethod = authorizationMethod;
  action.authorizedAccounts = authorizedAccounts ? authorizedAccounts : [];
  action.requiredRole = requiredRole;

  action.save();
  return action;
}

export function actionExecuted(
  event: ethereum.Event,
  actionName: string,
  target: Bytes,
  authorizedAccounts: Bytes[] | null,
  requiredRole: string | null
): void {
  const id = actionId(actionName, target, authorizedAccounts, requiredRole);
  const action = Action.load(id);
  if (action) {
    action.executed = true;
    action.executedAt = event.block.timestamp;
    action.executedBy = event.transaction.from;
    action.save();
  }
}

export function actionRevoked(
  actionName: string,
  target: Bytes,
  authorizedAccounts: Bytes[] | null,
  requiredRole: string | null
): void {
  const id = actionId(actionName, target, authorizedAccounts, requiredRole);
  const action = Action.load(id);
  if (action) {
    action.executed = false;
    action.executedAt = null;
    action.executedBy = null;
    action.save();
  }
}
