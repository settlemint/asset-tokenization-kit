import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Action } from "../../generated/schema";

export function actionId(eventName: string, target: Address): Bytes {
  const idString = `${eventName}-${target.toHexString()}`;
  return Bytes.fromUTF8(idString);
}

export function createAction(
  event: ethereum.Event,
  eventName: string,
  target: Address,
  type: string,
  activeAt: BigInt,
  expiresAt: BigInt | null,
  authorizationMethod: string,
  authorizedAccounts: Address[] | null,
  requiredRole: string
): Action {
  const id = actionId(eventName, target);
  const action = new Action(id);

  action.name = eventName;
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
  eventName: string,
  target: Address
): void {
  const id = actionId(eventName, target);
  const action = Action.load(id);
  if (action) {
    action.executed = true;
    action.executedAt = event.block.timestamp;
    action.executedBy = event.transaction.from;
    action.save();
  }
}
